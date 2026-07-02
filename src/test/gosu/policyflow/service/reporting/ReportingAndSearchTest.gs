package policyflow.service.reporting

uses org.junit.Assert
uses org.junit.Before
uses org.junit.Test
uses policyflow.domain.reporting.PortfolioSummary
uses policyflow.domain.policy.Policy
uses policyflow.domain.policy.PolicyStatus
uses policyflow.domain.policy.PolicyType
uses policyflow.domain.claim.Claim
uses policyflow.domain.claim.ClaimStatus
uses policyflow.domain.claim.ClaimType
uses policyflow.domain.account.Contact
uses policyflow.domain.account.ContactType
uses policyflow.domain.account.Address
uses policyflow.domain.vehicle.Vehicle
uses policyflow.domain.vehicle.VehicleType
uses policyflow.domain.vehicle.FuelType
uses policyflow.domain.search.ContactSearchCriteria
uses policyflow.domain.search.PolicySearchCriteria
uses policyflow.domain.search.ClaimSearchCriteria
uses policyflow.repository.policy.InMemoryPolicyRepository
uses policyflow.repository.claim.InMemoryClaimRepository
uses policyflow.repository.claim.InMemoryClaimHistoryRepository
uses policyflow.repository.vehicle.InMemoryVehicleRepository
uses policyflow.repository.account.InMemoryContactRepository
uses policyflow.service.rating.PremiumCalculationServiceImpl
uses policyflow.service.search.SearchService
uses policyflow.service.search.SearchServiceImpl
uses java.math.BigDecimal
uses java.time.LocalDate

/**
 * Unit tests verifying ReportingService and SearchService capabilities.
 */
public class ReportingAndSearchTest {
  private var _policyRepo : InMemoryPolicyRepository
  private var _claimRepo : InMemoryClaimRepository
  private var _historyRepo : InMemoryClaimHistoryRepository
  private var _vehicleRepo : InMemoryVehicleRepository
  private var _contactRepo : InMemoryContactRepository
  private var _premiumService : PremiumCalculationServiceImpl
  
  private var _reportingService : ReportingService
  private var _searchService : SearchService

  private var _contact1 : Contact
  private var _contact2 : Contact
  private var _vehicle1 : Vehicle
  private var _vehicle2 : Vehicle
  private var _policy1 : Policy
  private var _policy2 : Policy
  private var _claim1 : Claim
  private var _claim2 : Claim

  @Before
  public function setUp() {
    _policyRepo = new InMemoryPolicyRepository()
    _claimRepo = new InMemoryClaimRepository()
    _historyRepo = new InMemoryClaimHistoryRepository()
    _vehicleRepo = new InMemoryVehicleRepository()
    _contactRepo = new InMemoryContactRepository()
    _premiumService = new PremiumCalculationServiceImpl()

    _reportingService = new ReportingServiceImpl(_policyRepo, _claimRepo, _vehicleRepo, _contactRepo, _premiumService)
    _searchService = new SearchServiceImpl(_contactRepo, _policyRepo, _vehicleRepo, _claimRepo)

    // Populate Contacts
    _contact1 = new Contact(ContactType.PERSON)
    _contact1.FirstName = "Nataraj"
    _contact1.LastName = "EL"
    _contact1.EmailAddress = "nataraj@pwc.com"
    _contact1.PrimaryAddress = new Address("123 PwC Way", null, "New York", "NY", "10001", "USA")
    _contactRepo.save(_contact1)

    _contact2 = new Contact(ContactType.COMPANY)
    _contact2.FirstName = "John"
    _contact2.LastName = "PwC"
    _contact2.EmailAddress = "john@pwc.com"
    _contact2.PrimaryAddress = new Address("456 Consulting Rd", null, "London", "ON", "N6A1A1", "Canada")
    _contactRepo.save(_contact2)

    // Populate Vehicles
    _vehicle1 = new Vehicle("VIN12345678901234")
    _vehicle1.Make = "Ford"
    _vehicle1.Model = "Explorer"
    _vehicle1.ManufactureYear = 2020
    _vehicle1.VehicleType = VehicleType.SUV
    _vehicle1.FuelType = FuelType.GASOLINE
    _vehicleRepo.save(_vehicle1)

    _vehicle2 = new Vehicle("VIN98765432109876")
    _vehicle2.Make = "Toyota"
    _vehicle2.Model = "Camry"
    _vehicle2.ManufactureYear = 2021
    _vehicle2.VehicleType = VehicleType.SEDAN
    _vehicle2.FuelType = FuelType.HYBRID
    _vehicleRepo.save(_vehicle2)

    // Populate Policies
    _policy1 = new Policy()
    _policy1.PolicyType = PolicyType.PERSONAL_AUTO
    _policy1.Status = PolicyStatus.IN_FORCE
    _policy1.PrimaryNamedInsuredId = _contact1.ID
    _policy1.VehicleId = _vehicle1.ID
    _policy1.EffectiveDate = LocalDate.of(2026, 7, 1)
    _policy1.ExpirationDate = LocalDate.of(2027, 7, 1)
    _policyRepo.save(_policy1)

    _policy2 = new Policy()
    _policy2.PolicyType = PolicyType.COMMERCIAL_AUTO
    _policy2.Status = PolicyStatus.DRAFT
    _policy2.PrimaryNamedInsuredId = _contact2.ID
    _policy2.VehicleId = _vehicle2.ID
    _policy2.EffectiveDate = LocalDate.of(2026, 7, 1)
    _policy2.ExpirationDate = LocalDate.of(2027, 7, 1)
    _policyRepo.save(_policy2)

    // Populate Claims
    _claim1 = new Claim()
    _claim1.PolicyId = _policy1.ID
    _claim1.ClaimType = ClaimType.COLLISION
    _claim1.Status = ClaimStatus.OPEN
    _claim1.LossDate = LocalDate.of(2026, 7, 1)
    _claim1.ReportedDate = LocalDate.of(2026, 7, 2)
    _claim1.Description = "Hail storm damage on hood."
    _claimRepo.save(_claim1)

    _claim2 = new Claim()
    _claim2.PolicyId = _policy1.ID
    _claim2.ClaimType = ClaimType.THEFT
    _claim2.Status = ClaimStatus.CLOSED
    _claim2.LossDate = LocalDate.of(2026, 7, 1)
    _claim2.ReportedDate = LocalDate.of(2026, 7, 2)
    _claim2.Description = "Minor mirror dent."
    _claimRepo.save(_claim2)
  }

  @Test
  public function testGeneratePortfolioSummary() {
    var summary = _reportingService.generatePortfolioSummary()
    Assert.assertNotNull(summary)
    Assert.assertNotNull(summary.GeneratedAt)
    Assert.assertEquals(1, summary.ActivePoliciesCount)
    Assert.assertEquals(1, summary.OpenClaimsCount)

    // Policies by Status & Type
    Assert.assertEquals(1, (summary.PoliciesByStatus.get(PolicyStatus.IN_FORCE) as int))
    Assert.assertEquals(1, (summary.PoliciesByStatus.get(PolicyStatus.DRAFT) as int))
    Assert.assertEquals(1, (summary.PoliciesByType.get(PolicyType.PERSONAL_AUTO) as int))

    // Claims by Status
    Assert.assertEquals(1, (summary.ClaimsByStatus.get(ClaimStatus.OPEN) as int))
    Assert.assertEquals(1, (summary.ClaimsByStatus.get(ClaimStatus.CLOSED) as int))

    // Vehicles & Contacts distribution
    Assert.assertEquals(1, (summary.VehiclesByType.get(VehicleType.SUV) as int))
    Assert.assertEquals(1, (summary.ContactsByType.get(ContactType.PERSON) as int))

    // Total premium should be populated (positive value computed from the rating engine)
    Assert.assertTrue(summary.TotalPremium.compareTo(BigDecimal.ZERO) > 0)
  }

  @Test
  public function testSearchContactsByNameAndEmail() {
    var crit = new ContactSearchCriteria()
    crit.FirstName = "  nataraj  " // check trimming and case-insensitive
    
    var results1 = _searchService.searchContacts(crit)
    Assert.assertEquals(1, results1.size())
    Assert.assertEquals(_contact1.ID, results1.get(0).ID)

    var crit2 = new ContactSearchCriteria()
    crit2.Email = "john@pwc.com"
    var results2 = _searchService.searchContacts(crit2)
    Assert.assertEquals(1, results2.size())
    Assert.assertEquals(_contact2.ID, results2.get(0).ID)
  }

  @Test
  public function testSearchContactsByVehicleMake() {
    var crit = new ContactSearchCriteria()
    crit.VehicleMake = "  FoRd  " // check trimming and case-insensitive
    
    var results = _searchService.searchContacts(crit)
    Assert.assertEquals(1, results.size())
    Assert.assertEquals(_contact1.ID, results.get(0).ID)
  }

  @Test
  public function testSearchPoliciesByNumberAndStatus() {
    var crit = new PolicySearchCriteria()
    crit.PolicyNumber = _policy1.PolicyNumber
    var results1 = _searchService.searchPolicies(crit)
    Assert.assertEquals(1, results1.size())
    Assert.assertEquals(_policy1.ID, results1.get(0).ID)

    var crit2 = new PolicySearchCriteria()
    crit2.Status = PolicyStatus.DRAFT
    var results2 = _searchService.searchPolicies(crit2)
    Assert.assertEquals(1, results2.size())
    Assert.assertEquals(_policy2.ID, results2.get(0).ID)
  }

  @Test
  public function testSearchPoliciesByInsuredName() {
    var crit = new PolicySearchCriteria()
    crit.ContactFirstName = "nataraj"
    var results1 = _searchService.searchPolicies(crit)
    Assert.assertEquals(1, results1.size())
    Assert.assertEquals(_policy1.ID, results1.get(0).ID)

    var crit2 = new PolicySearchCriteria()
    crit2.ContactLastName = "pwc"
    var results2 = _searchService.searchPolicies(crit2)
    Assert.assertEquals(1, results2.size())
    Assert.assertEquals(_policy2.ID, results2.get(0).ID)
  }

  @Test
  public function testSearchClaimsByNumberAndStatus() {
    var crit = new ClaimSearchCriteria()
    crit.ClaimNumber = _claim1.ClaimNumber
    var results1 = _searchService.searchClaims(crit)
    Assert.assertEquals(1, results1.size())
    Assert.assertEquals(_claim1.ID, results1.get(0).ID)

    var crit2 = new ClaimSearchCriteria()
    crit2.Status = ClaimStatus.CLOSED
    var results2 = _searchService.searchClaims(crit2)
    Assert.assertEquals(1, results2.size())
    Assert.assertEquals(_claim2.ID, results2.get(0).ID)
  }

  @Test
  public function testSearchClaimsByVin() {
    var crit = new ClaimSearchCriteria()
    crit.Vin = "VIN123" // substring match
    
    // Both claims are on Policy 1, which is linked to Vehicle 1 (VIN123...)
    var results = _searchService.searchClaims(crit)
    Assert.assertEquals(2, results.size())
  }

  @Test
  public function testSearchClaimsByContactEmail() {
    var crit = new ClaimSearchCriteria()
    crit.ContactEmail = "nataraj@pwc.com"

    var results = _searchService.searchClaims(crit)
    Assert.assertEquals(2, results.size())
  }
}
