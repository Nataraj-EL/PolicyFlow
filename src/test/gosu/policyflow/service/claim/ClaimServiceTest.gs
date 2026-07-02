package policyflow.service.claim

uses org.junit.Assert
uses org.junit.Before
uses org.junit.Test
uses policyflow.domain.claim.Claim
uses policyflow.domain.claim.ClaimStatus
uses policyflow.domain.claim.ClaimType
uses policyflow.domain.claim.ClaimTransactionType
uses policyflow.domain.policy.Policy
uses policyflow.domain.policy.PolicyStatus
uses policyflow.domain.policy.PolicyType
uses policyflow.domain.account.Contact
uses policyflow.domain.account.ContactType
uses policyflow.domain.account.Address
uses policyflow.domain.vehicle.Vehicle
uses policyflow.domain.vehicle.VehicleType
uses policyflow.domain.vehicle.FuelType
uses policyflow.repository.claim.InMemoryClaimRepository
uses policyflow.repository.claim.InMemoryClaimHistoryRepository
uses policyflow.repository.policy.InMemoryPolicyRepository
uses policyflow.repository.account.InMemoryContactRepository
uses policyflow.repository.vehicle.InMemoryVehicleRepository
uses policyflow.service.policy.PolicyServiceImpl
uses policyflow.validation.ValidationException
uses java.time.LocalDate
uses java.util.UUID

/**
 * Unit tests for {@link ClaimService} and {@link ClaimServiceImpl}.
 */
public class ClaimServiceTest {
  private var _claimRepo : InMemoryClaimRepository
  private var _historyRepo : InMemoryClaimHistoryRepository
  private var _policyRepo : InMemoryPolicyRepository
  private var _contactRepo : InMemoryContactRepository
  private var _vehicleRepo : InMemoryVehicleRepository
  private var _service : ClaimServiceImpl
  private var _policyService : PolicyServiceImpl

  private var _contactId : UUID
  private var _vehicleId : UUID
  private var _policyId : UUID

  @Before
  public function setUp() {
    _claimRepo = new InMemoryClaimRepository()
    _historyRepo = new InMemoryClaimHistoryRepository()
    _policyRepo = new InMemoryPolicyRepository()
    _contactRepo = new InMemoryContactRepository()
    _vehicleRepo = new InMemoryVehicleRepository()
    
    _service = new ClaimServiceImpl(_claimRepo, _historyRepo, _policyRepo)
    _policyService = new PolicyServiceImpl(_policyRepo, _contactRepo, _vehicleRepo)

    // Pre-populate Contact
    var contact = new Contact(ContactType.PERSON)
    contact.FirstName = "Nataraj"
    contact.LastName = "EL"
    contact.EmailAddress = "nataraj@pwc.com"
    contact.PrimaryAddress = new Address("123 PwC Way", null, "New York", "NY", "10001", "USA")
    _contactRepo.save(contact)
    _contactId = contact.ID

    // Pre-populate Vehicle
    var vehicle = new Vehicle("1FM5K8F88HGA12345")
    vehicle.Make = "Ford"
    vehicle.Model = "Explorer"
    vehicle.ManufactureYear = 2017
    vehicle.VehicleType = VehicleType.SUV
    vehicle.FuelType = FuelType.GASOLINE
    _vehicleRepo.save(vehicle)
    _vehicleId = vehicle.ID

    // Pre-populate Policy (IN_FORCE)
    var policy = new Policy()
    policy.PolicyType = PolicyType.PERSONAL_AUTO
    policy.Status = PolicyStatus.IN_FORCE
    policy.PrimaryNamedInsuredId = _contactId
    policy.VehicleId = _vehicleId
    policy.EffectiveDate = LocalDate.of(2026, 7, 1)
    policy.ExpirationDate = LocalDate.of(2027, 7, 1)
    _policyService.createPolicy(policy)
    _policyId = policy.ID
  }

  @Test
  public function testFileClaimSuccessful() {
    var claim = new Claim()
    claim.PolicyId = _policyId
    claim.ClaimType = ClaimType.COLLISION
    claim.LossDate = LocalDate.of(2026, 7, 1)
    claim.ReportedDate = LocalDate.of(2026, 7, 2)
    claim.Description = "Rear-end collision at intersection."
    claim.AdjusterName = "Jane Adjuster"

    var saved = _service.fileClaim(claim)
    Assert.assertNotNull(saved)
    Assert.assertNotNull(saved.ID)
    Assert.assertEquals(ClaimStatus.OPEN, saved.Status)

    var retrieved = _service.getClaim(saved.ID)
    Assert.assertEquals(saved, retrieved)

    // Check history logs
    var history = _service.getClaimHistory(saved.ID)
    Assert.assertEquals(1, history.size())
    Assert.assertEquals(ClaimTransactionType.CREATION, history.get(0).TransactionType)
    Assert.assertNull(history.get(0).OldStatus)
    Assert.assertEquals(ClaimStatus.OPEN, history.get(0).NewStatus)
  }

  @Test
  public function testFileClaimFutureLossDateThrowsException() {
    var claim = new Claim()
    claim.PolicyId = _policyId
    claim.ClaimType = ClaimType.COLLISION
    // Future loss date
    claim.LossDate = LocalDate.now().plusDays(1)
    claim.ReportedDate = LocalDate.now()
    claim.Description = "Future crash."

    try {
      _service.fileClaim(claim)
      Assert.fail("Expected ValidationException due to future loss date")
    } catch (e : ValidationException) {
      Assert.assertTrue(e.Errors.get(0).contains("cannot be in the future"))
    }
  }

  @Test
  public function testFileClaimReportedBeforeLossThrowsException() {
    var claim = new Claim()
    claim.PolicyId = _policyId
    claim.ClaimType = ClaimType.COLLISION
    claim.LossDate = LocalDate.of(2026, 7, 2)
    // Reported before Loss
    claim.ReportedDate = LocalDate.of(2026, 7, 1)
    claim.Description = "Crash description."

    try {
      _service.fileClaim(claim)
      Assert.fail("Expected ValidationException")
    } catch (e : ValidationException) {
      Assert.assertTrue(e.Errors.get(0).contains("cannot be before Loss Date"))
    }
  }

  @Test
  public function testFileClaimPolicyNotInForceThrowsException() {
    // Create draft policy
    var draftPolicy = new Policy()
    draftPolicy.PolicyType = PolicyType.PERSONAL_AUTO
    draftPolicy.Status = PolicyStatus.DRAFT
    draftPolicy.PrimaryNamedInsuredId = _contactId
    draftPolicy.VehicleId = _vehicleId
    draftPolicy.EffectiveDate = LocalDate.of(2026, 7, 1)
    draftPolicy.ExpirationDate = LocalDate.of(2027, 7, 1)
    _policyService.createPolicy(draftPolicy)

    var claim = new Claim()
    claim.PolicyId = draftPolicy.ID
    claim.ClaimType = ClaimType.COLLISION
    claim.LossDate = LocalDate.of(2026, 7, 1)
    claim.ReportedDate = LocalDate.of(2026, 7, 2)
    claim.Description = "Filing claim against draft policy."

    try {
      _service.fileClaim(claim)
      Assert.fail("Expected IllegalArgumentException")
    } catch (e : IllegalArgumentException) {
      Assert.assertTrue(e.Message.contains("Claims can only be filed against IN_FORCE policies"))
    }
  }

  @Test
  public function testFileClaimOutsideTermEffectiveThrowsException() {
    var claim = new Claim()
    claim.PolicyId = _policyId
    claim.ClaimType = ClaimType.COLLISION
    // Loss date before effective date (2026-07-01)
    claim.LossDate = LocalDate.of(2026, 6, 30)
    claim.ReportedDate = LocalDate.of(2026, 7, 2)
    claim.Description = "Loss occurred before policy start."

    try {
      _service.fileClaim(claim)
      Assert.fail("Expected IllegalArgumentException")
    } catch (e : IllegalArgumentException) {
      Assert.assertTrue(e.Message.contains("must fall within the Policy term"))
    }
  }

  @Test
  public function testFileClaimDuplicateClaimNumberThrowsException() {
    var claim1 = new Claim()
    claim1.PolicyId = _policyId
    claim1.ClaimType = ClaimType.COLLISION
    claim1.LossDate = LocalDate.of(2026, 7, 1)
    claim1.ReportedDate = LocalDate.of(2026, 7, 2)
    claim1.Description = "Rear-end collision."
    var saved1 = _service.fileClaim(claim1)

    // Try to file another claim with same ClaimNumber
    var claim2 = new Claim()
    claim2.PolicyId = _policyId
    claim2.ClaimType = ClaimType.THEFT
    claim2.LossDate = LocalDate.of(2026, 7, 1)
    claim2.ReportedDate = LocalDate.of(2026, 7, 2)
    claim2.Description = "Theft of catalytic converter."
    claim2.ClaimNumber = saved1.ClaimNumber // Forced duplicate

    try {
      _service.fileClaim(claim2)
      Assert.fail("Expected IllegalArgumentException due to duplicate ClaimNumber")
    } catch (e : IllegalArgumentException) {
      Assert.assertTrue(e.Message.contains("Claim Number already in use"))
    }
  }

  @Test
  public function testUpdateClaimSuccessful() {
    var claim = new Claim()
    claim.PolicyId = _policyId
    claim.ClaimType = ClaimType.COLLISION
    claim.LossDate = LocalDate.of(2026, 7, 1)
    claim.ReportedDate = LocalDate.of(2026, 7, 2)
    claim.Description = "Fender bender."
    var saved = _service.fileClaim(claim)

    saved.Description = "Severe fender bender with radiator leak."
    saved.AdjusterName = "Jack Adjuster"

    var updated = _service.updateClaim(saved)
    Assert.assertEquals("Severe fender bender with radiator leak.", updated.Description)
    Assert.assertEquals("Jack Adjuster", updated.AdjusterName)

    // Check history logs
    var history = _service.getClaimHistory(saved.ID)
    Assert.assertEquals(2, history.size())
    Assert.assertEquals(ClaimTransactionType.UPDATE, history.get(1).TransactionType)
  }

  @Test
  public function testUpdateClosedClaimThrowsException() {
    var claim = new Claim()
    claim.PolicyId = _policyId
    claim.ClaimType = ClaimType.COLLISION
    claim.LossDate = LocalDate.of(2026, 7, 1)
    claim.ReportedDate = LocalDate.of(2026, 7, 2)
    claim.Description = "Windshield crack."
    var saved = _service.fileClaim(claim)

    _service.closeClaim(saved.ID, "Windshield replaced.")

    saved.Description = "Updated windshield crack description."
    try {
      _service.updateClaim(saved)
      Assert.fail("Expected IllegalArgumentException since claim is closed")
    } catch (e : IllegalArgumentException) {
      Assert.assertTrue(e.Message.contains("Closed claims cannot be updated"))
    }
  }

  @Test
  public function testCloseAlreadyClosedThrowsException() {
    var claim = new Claim()
    claim.PolicyId = _policyId
    claim.ClaimType = ClaimType.THEFT
    claim.LossDate = LocalDate.of(2026, 7, 1)
    claim.ReportedDate = LocalDate.of(2026, 7, 2)
    claim.Description = "Stolen mirrors."
    var saved = _service.fileClaim(claim)

    _service.closeClaim(saved.ID, "Mirrors replaced.")

    try {
      _service.closeClaim(saved.ID, "Closing again.")
      Assert.fail("Expected IllegalArgumentException")
    } catch (e : IllegalArgumentException) {
      Assert.assertTrue(e.Message.contains("Claim is already closed"))
    }
  }

  @Test
  public function testSearchClaims() {
    var claim = new Claim()
    claim.PolicyId = _policyId
    claim.ClaimType = ClaimType.WEATHER
    claim.LossDate = LocalDate.of(2026, 7, 1)
    claim.ReportedDate = LocalDate.of(2026, 7, 2)
    claim.Description = "Hail damage on hood."
    var saved = _service.fileClaim(claim)

    // Search by claim number
    var results = _service.searchClaims(saved.ClaimNumber, null, null)
    Assert.assertEquals(1, results.size())
    Assert.assertEquals(saved.ID, results.get(0).ID)

    // Search by status
    results = _service.searchClaims(null, ClaimStatus.OPEN, null)
    Assert.assertEquals(1, results.size())
    Assert.assertEquals(saved.ID, results.get(0).ID)

    // Search by policy ID
    results = _service.searchClaims(null, null, _policyId)
    Assert.assertEquals(1, results.size())
    Assert.assertEquals(saved.ID, results.get(0).ID)
  }
}
