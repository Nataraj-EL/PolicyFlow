package policyflow.service.policy

uses org.junit.Assert
uses org.junit.Before
uses org.junit.Test
uses policyflow.domain.policy.Policy
uses policyflow.domain.policy.PolicyStatus
uses policyflow.domain.policy.PolicyType
uses policyflow.domain.policy.PolicyTransactionType
uses policyflow.domain.account.Contact
uses policyflow.domain.account.ContactType
uses policyflow.domain.account.Address
uses policyflow.domain.vehicle.Vehicle
uses policyflow.domain.vehicle.VehicleType
uses policyflow.domain.vehicle.FuelType
uses policyflow.repository.policy.InMemoryPolicyRepository
uses policyflow.repository.policy.InMemoryPolicyHistoryRepository
uses policyflow.repository.account.InMemoryContactRepository
uses policyflow.repository.vehicle.InMemoryVehicleRepository
uses policyflow.validation.ValidationException
uses java.time.LocalDate
uses java.util.UUID

/**
 * Unit tests for {@link PolicyService} and {@link PolicyServiceImpl}.
 */
public class PolicyServiceTest {
  private var _policyRepo : InMemoryPolicyRepository
  private var _historyRepo : InMemoryPolicyHistoryRepository
  private var _contactRepo : InMemoryContactRepository
  private var _vehicleRepo : InMemoryVehicleRepository
  private var _service : PolicyServiceImpl

  private var _contactId : UUID
  private var _vehicleId : UUID

  @Before
  public function setUp() {
    _policyRepo = new InMemoryPolicyRepository()
    _historyRepo = new InMemoryPolicyHistoryRepository()
    _contactRepo = new InMemoryContactRepository()
    _vehicleRepo = new InMemoryVehicleRepository()
    _service = new PolicyServiceImpl(_policyRepo, _contactRepo, _vehicleRepo, _historyRepo)

    // Pre-populate a contact
    var contact = new Contact(ContactType.PERSON)
    contact.FirstName = "Nataraj"
    contact.LastName = "EL"
    contact.EmailAddress = "nataraj@pwc.com"
    contact.PrimaryAddress = new Address("123 PwC Way", null, "New York", "NY", "10001", "USA")
    _contactRepo.save(contact)
    _contactId = contact.ID

    // Pre-populate a vehicle
    var vehicle = new Vehicle("1FM5K8F88HGA12345")
    vehicle.Make = "Ford"
    vehicle.Model = "Explorer"
    vehicle.ManufactureYear = 2017
    vehicle.VehicleType = VehicleType.SUV
    vehicle.FuelType = FuelType.GASOLINE
    _vehicleRepo.save(vehicle)
    _vehicleId = vehicle.ID
  }

  @Test
  public function testCreatePolicySuccessful() {
    var policy = new Policy()
    policy.PolicyType = PolicyType.PERSONAL_AUTO
    policy.Status = PolicyStatus.DRAFT
    policy.PrimaryNamedInsuredId = _contactId
    policy.VehicleId = _vehicleId
    policy.EffectiveDate = LocalDate.of(2026, 7, 1)
    policy.ExpirationDate = LocalDate.of(2027, 7, 1)

    var saved = _service.createPolicy(policy)
    Assert.assertNotNull(saved)
    Assert.assertNotNull(saved.ID)
    Assert.assertNotNull(saved.PolicyNumber)
    Assert.assertEquals(PolicyStatus.DRAFT, saved.Status)

    var retrieved = _service.getPolicy(saved.ID)
    Assert.assertEquals(saved, retrieved)

    // Check history trail
    var history = _service.getPolicyHistory(saved.ID)
    Assert.assertEquals(1, history.size())
    Assert.assertEquals(PolicyTransactionType.CREATION, history.get(0).TransactionType)
    Assert.assertNull(history.get(0).OldStatus)
    Assert.assertEquals(PolicyStatus.DRAFT, history.get(0).NewStatus)
    Assert.assertEquals("SYSTEM", history.get(0).PerformedBy)
  }

  @Test
  public function testCreatePolicyValidationFailureThrowsException() {
    var policy = new Policy()
    policy.PolicyType = PolicyType.PERSONAL_AUTO
    policy.Status = PolicyStatus.DRAFT
    policy.PrimaryNamedInsuredId = _contactId
    policy.VehicleId = _vehicleId
    // Expiration date before Effective date
    policy.EffectiveDate = LocalDate.of(2026, 7, 1)
    policy.ExpirationDate = LocalDate.of(2025, 7, 1)

    try {
      _service.createPolicy(policy)
      Assert.fail("Expected ValidationException")
    } catch (e : ValidationException) {
      Assert.assertTrue(e.Errors.size() > 0)
      Assert.assertTrue(e.Errors.get(0).contains("must be after Effective Date"))
    }
  }

  @Test
  public function testCreatePolicyMissingContactThrowsException() {
    var policy = new Policy()
    policy.PolicyType = PolicyType.PERSONAL_AUTO
    policy.Status = PolicyStatus.DRAFT
    policy.PrimaryNamedInsuredId = UUID.randomUUID() // Non-existent Contact
    policy.VehicleId = _vehicleId
    policy.EffectiveDate = LocalDate.of(2026, 7, 1)
    policy.ExpirationDate = LocalDate.of(2027, 7, 1)

    try {
      _service.createPolicy(policy)
      Assert.fail("Expected IllegalArgumentException")
    } catch (e : IllegalArgumentException) {
      Assert.assertTrue(e.Message.contains("Linked Contact does not exist"))
    }
  }

  @Test
  public function testCreatePolicyMissingVehicleThrowsException() {
    var policy = new Policy()
    policy.PolicyType = PolicyType.PERSONAL_AUTO
    policy.Status = PolicyStatus.DRAFT
    policy.PrimaryNamedInsuredId = _contactId
    policy.VehicleId = UUID.randomUUID() // Non-existent Vehicle
    policy.EffectiveDate = LocalDate.of(2026, 7, 1)
    policy.ExpirationDate = LocalDate.of(2027, 7, 1)

    try {
      _service.createPolicy(policy)
      Assert.fail("Expected IllegalArgumentException")
    } catch (e : IllegalArgumentException) {
      Assert.assertTrue(e.Message.contains("Linked Vehicle does not exist"))
    }
  }

  @Test
  public function testCreatePolicyDuplicateActivePolicyThrowsException() {
    // 1. Create first in-force policy
    var policy1 = new Policy()
    policy1.PolicyType = PolicyType.PERSONAL_AUTO
    policy1.Status = PolicyStatus.IN_FORCE
    policy1.PrimaryNamedInsuredId = _contactId
    policy1.VehicleId = _vehicleId
    policy1.EffectiveDate = LocalDate.of(2026, 7, 1)
    policy1.ExpirationDate = LocalDate.of(2027, 7, 1)
    _service.createPolicy(policy1)

    // 2. Try to create a second in-force policy for the same vehicle
    var policy2 = new Policy()
    policy2.PolicyType = PolicyType.PERSONAL_AUTO
    policy2.Status = PolicyStatus.IN_FORCE
    policy2.PrimaryNamedInsuredId = _contactId
    policy2.VehicleId = _vehicleId
    policy2.EffectiveDate = LocalDate.of(2026, 8, 1)
    policy2.ExpirationDate = LocalDate.of(2027, 8, 1)

    try {
      _service.createPolicy(policy2)
      Assert.fail("Expected IllegalArgumentException due to multiple active policies")
    } catch (e : IllegalArgumentException) {
      Assert.assertTrue(e.Message.contains("Vehicle already has an active IN_FORCE policy"))
    }
  }

  @Test
  public function testUpdateAllowsSameActivePolicy() {
    var policy = new Policy()
    policy.PolicyType = PolicyType.PERSONAL_AUTO
    policy.Status = PolicyStatus.IN_FORCE
    policy.PrimaryNamedInsuredId = _contactId
    policy.VehicleId = _vehicleId
    policy.EffectiveDate = LocalDate.of(2026, 7, 1)
    policy.ExpirationDate = LocalDate.of(2027, 7, 1)
    var saved = _service.createPolicy(policy)

    // Update expiration date (still IN_FORCE)
    saved.ExpirationDate = LocalDate.of(2028, 7, 1)
    var updated = _service.updatePolicy(saved)
    Assert.assertEquals(LocalDate.of(2028, 7, 1), updated.ExpirationDate)

    // Verify history logs
    var history = _service.getPolicyHistory(saved.ID)
    Assert.assertEquals(2, history.size())
    Assert.assertEquals(PolicyTransactionType.ENDORSEMENT, history.get(1).TransactionType)
  }

  @Test
  public function testCancelPolicySuccessful() {
    var policy = new Policy()
    policy.PolicyType = PolicyType.PERSONAL_AUTO
    policy.Status = PolicyStatus.IN_FORCE
    policy.PrimaryNamedInsuredId = _contactId
    policy.VehicleId = _vehicleId
    policy.EffectiveDate = LocalDate.of(2026, 7, 1)
    policy.ExpirationDate = LocalDate.of(2027, 7, 1)
    var saved = _service.createPolicy(policy)

    var cancelDate = LocalDate.of(2026, 8, 1)
    _service.cancelPolicy(saved.ID, cancelDate, "Customer Request")

    var cancelled = _service.getPolicy(saved.ID)
    Assert.assertEquals(PolicyStatus.CANCELLED, cancelled.Status)
    Assert.assertEquals(cancelDate, cancelled.CancellationDate)
    Assert.assertEquals("Customer Request", cancelled.CancellationReason)

    // Verify history logs
    var history = _service.getPolicyHistory(saved.ID)
    Assert.assertEquals(2, history.size())
    Assert.assertEquals(PolicyTransactionType.CANCELLATION, history.get(1).TransactionType)
    Assert.assertEquals(PolicyStatus.IN_FORCE, history.get(1).OldStatus)
    Assert.assertEquals(PolicyStatus.CANCELLED, history.get(1).NewStatus)
  }

  @Test
  public function testCancelPolicyMissingReasonThrowsException() {
    var policy = new Policy()
    policy.PolicyType = PolicyType.PERSONAL_AUTO
    policy.Status = PolicyStatus.IN_FORCE
    policy.PrimaryNamedInsuredId = _contactId
    policy.VehicleId = _vehicleId
    policy.EffectiveDate = LocalDate.of(2026, 7, 1)
    policy.ExpirationDate = LocalDate.of(2027, 7, 1)
    var saved = _service.createPolicy(policy)

    try {
      _service.cancelPolicy(saved.ID, LocalDate.of(2026, 8, 1), null)
      Assert.fail("Expected ValidationException due to missing cancellation reason")
    } catch (e : ValidationException) {
      Assert.assertTrue(e.Errors.contains("Cancellation Reason is required for cancelled policies."))
    }
  }

  @Test
  public function testSearchPolicies() {
    var policy1 = new Policy()
    policy1.PolicyType = PolicyType.PERSONAL_AUTO
    policy1.Status = PolicyStatus.DRAFT
    policy1.PrimaryNamedInsuredId = _contactId
    policy1.VehicleId = _vehicleId
    policy1.EffectiveDate = LocalDate.of(2026, 7, 1)
    policy1.ExpirationDate = LocalDate.of(2027, 7, 1)
    var saved1 = _service.createPolicy(policy1)

    var policy2 = new Policy()
    policy2.PolicyType = PolicyType.COMMERCIAL_AUTO
    policy2.Status = PolicyStatus.IN_FORCE
    policy2.PrimaryNamedInsuredId = _contactId
    policy2.VehicleId = _vehicleId
    policy2.EffectiveDate = LocalDate.of(2026, 7, 1)
    policy2.ExpirationDate = LocalDate.of(2027, 7, 1)
    var saved2 = _service.createPolicy(policy2)

    // Search by policy number
    var results = _service.searchPolicies(saved1.PolicyNumber, null, null)
    Assert.assertEquals(1, results.size())
    Assert.assertEquals(saved1.ID, results.get(0).ID)

    // Search by status
    results = _service.searchPolicies(null, PolicyStatus.IN_FORCE, null)
    Assert.assertEquals(1, results.size())
    Assert.assertEquals(saved2.ID, results.get(0).ID)

    // Search by type
    results = _service.searchPolicies(null, null, PolicyType.PERSONAL_AUTO)
    Assert.assertEquals(1, results.size())
    Assert.assertEquals(saved1.ID, results.get(0).ID)
  }

  @Test
  public function testRenewPolicySuccessful() {
    var policy = new Policy()
    policy.PolicyType = PolicyType.PERSONAL_AUTO
    policy.Status = PolicyStatus.IN_FORCE
    policy.PrimaryNamedInsuredId = _contactId
    policy.VehicleId = _vehicleId
    policy.EffectiveDate = LocalDate.of(2026, 7, 1)
    policy.ExpirationDate = LocalDate.of(2027, 7, 1)
    var baseTerm = _service.createPolicy(policy)

    var renewed = _service.renewPolicy(baseTerm.ID)
    Assert.assertNotNull(renewed)
    Assert.assertNotEquals(baseTerm.PolicyNumber, renewed.PolicyNumber) // New immutable PolicyNumber
    Assert.assertEquals(baseTerm.ID, renewed.PreviousPolicyId) // PreviousPolicyId linkage
    Assert.assertEquals(PolicyStatus.DRAFT, renewed.Status)
    Assert.assertEquals(baseTerm.ExpirationDate, renewed.EffectiveDate) // Effective starts on old expiration
    Assert.assertEquals(baseTerm.ExpirationDate.plusYears(1), renewed.ExpirationDate)

    // Audit logs checks
    var baseHistory = _service.getPolicyHistory(baseTerm.ID)
    Assert.assertEquals(2, baseHistory.size())
    Assert.assertEquals(PolicyTransactionType.RENEWAL, baseHistory.get(1).TransactionType)

    var renewedHistory = _service.getPolicyHistory(renewed.ID)
    Assert.assertEquals(1, renewedHistory.size())
    Assert.assertEquals(PolicyTransactionType.CREATION, renewedHistory.get(0).TransactionType)
    Assert.assertTrue(renewedHistory.get(0).Description.contains("Created via renewal"))
  }

  @Test
  public function testRenewPolicyInvalidStateThrowsException() {
    var policy = new Policy()
    policy.PolicyType = PolicyType.PERSONAL_AUTO
    policy.Status = PolicyStatus.DRAFT // Draft term cannot be renewed
    policy.PrimaryNamedInsuredId = _contactId
    policy.VehicleId = _vehicleId
    policy.EffectiveDate = LocalDate.of(2026, 7, 1)
    policy.ExpirationDate = LocalDate.of(2027, 7, 1)
    var draftTerm = _service.createPolicy(policy)

    try {
      _service.renewPolicy(draftTerm.ID)
      Assert.fail("Expected IllegalArgumentException")
    } catch (e : IllegalArgumentException) {
      Assert.assertTrue(e.Message.contains("Only IN_FORCE or EXPIRED policies can be renewed"))
    }
  }

  @Test
  public function testExpirePolicySuccessful() {
    var policy = new Policy()
    policy.PolicyType = PolicyType.PERSONAL_AUTO
    policy.Status = PolicyStatus.IN_FORCE
    policy.PrimaryNamedInsuredId = _contactId
    policy.VehicleId = _vehicleId
    policy.EffectiveDate = LocalDate.of(2026, 7, 1)
    policy.ExpirationDate = LocalDate.of(2027, 7, 1)
    var saved = _service.createPolicy(policy)

    // Expiry succeeds at or after ExpirationDate
    _service.expirePolicy(saved.ID, LocalDate.of(2027, 7, 1))
    var expired = _service.getPolicy(saved.ID)
    Assert.assertEquals(PolicyStatus.EXPIRED, expired.Status)

    var history = _service.getPolicyHistory(saved.ID)
    Assert.assertEquals(2, history.size())
    Assert.assertEquals(PolicyTransactionType.EXPIRATION, history.get(1).TransactionType)
  }

  @Test
  public function testExpirePolicyPrematurelyThrowsException() {
    var policy = new Policy()
    policy.PolicyType = PolicyType.PERSONAL_AUTO
    policy.Status = PolicyStatus.IN_FORCE
    policy.PrimaryNamedInsuredId = _contactId
    policy.VehicleId = _vehicleId
    policy.EffectiveDate = LocalDate.of(2026, 7, 1)
    policy.ExpirationDate = LocalDate.of(2027, 7, 1)
    var saved = _service.createPolicy(policy)

    try {
      // Expiry fails if check date is before expiration date
      _service.expirePolicy(saved.ID, LocalDate.of(2027, 6, 30))
      Assert.fail("Expected IllegalArgumentException")
    } catch (e : IllegalArgumentException) {
      Assert.assertTrue(e.Message.contains("cannot be expired before its expiration date"))
    }
  }

  @Test
  public function testReinstatePolicySuccessful() {
    var policy = new Policy()
    policy.PolicyType = PolicyType.PERSONAL_AUTO
    policy.Status = PolicyStatus.IN_FORCE
    policy.PrimaryNamedInsuredId = _contactId
    policy.VehicleId = _vehicleId
    policy.EffectiveDate = LocalDate.of(2026, 7, 1)
    policy.ExpirationDate = LocalDate.of(2027, 7, 1)
    var saved = _service.createPolicy(policy)

    var cancelDate = LocalDate.of(2026, 8, 1)
    _service.cancelPolicy(saved.ID, cancelDate, "Non-payment")

    // Reinstate
    _service.reinstatePolicy(saved.ID, "Payment received")
    var reinstated = _service.getPolicy(saved.ID)
    Assert.assertEquals(PolicyStatus.IN_FORCE, reinstated.Status)
    
    // Cancellation Date and Reason MUST be retained for historical integrity
    Assert.assertEquals(cancelDate, reinstated.CancellationDate)
    Assert.assertEquals("Non-payment", reinstated.CancellationReason)

    // Audit logs checks
    var history = _service.getPolicyHistory(saved.ID)
    Assert.assertEquals(3, history.size())
    Assert.assertEquals(PolicyTransactionType.REINSTATEMENT, history.get(2).TransactionType)
    Assert.assertEquals("SYSTEM", history.get(2).PerformedBy)
  }

  @Test
  public function testEndorsePolicySuccessful() {
    var policy = new Policy()
    policy.PolicyType = PolicyType.PERSONAL_AUTO
    policy.Status = PolicyStatus.IN_FORCE
    policy.PrimaryNamedInsuredId = _contactId
    policy.VehicleId = _vehicleId
    policy.EffectiveDate = LocalDate.of(2026, 7, 1)
    policy.ExpirationDate = LocalDate.of(2027, 7, 1)
    var saved = _service.createPolicy(policy)

    // Endorse change (update type)
    saved.PolicyType = PolicyType.COMMERCIAL_AUTO
    var endorsed = _service.endorsePolicy(saved, "Change to Commercial Auto coverage")

    Assert.assertEquals(PolicyType.COMMERCIAL_AUTO, endorsed.PolicyType)

    // Verify history logs
    var history = _service.getPolicyHistory(saved.ID)
    Assert.assertEquals(2, history.size())
    Assert.assertEquals(PolicyTransactionType.ENDORSEMENT, history.get(1).TransactionType)
    Assert.assertEquals("Endorsement: Change to Commercial Auto coverage", history.get(1).Description)
  }
}
