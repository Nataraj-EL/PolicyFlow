package policyflow.common

uses org.junit.Assert
uses org.junit.Before
uses org.junit.Test
uses policyflow.common.bootstrap.AppContainer
uses policyflow.common.exception.PolicyFlowException
uses policyflow.common.exception.EntityNotFoundException
uses policyflow.common.exception.BusinessRuleException
uses policyflow.common.exception.ExceptionFormatter
uses policyflow.common.logging.StructuredLogger
uses policyflow.common.time.ClockProvider
uses policyflow.common.util.SanitizationUtil
uses policyflow.domain.account.Contact
uses policyflow.domain.account.ContactType
uses policyflow.domain.vehicle.Vehicle
uses policyflow.domain.policy.Policy
uses policyflow.domain.claim.Claim
uses policyflow.validation.ValidationException
uses java.time.LocalDate
uses java.util.HashMap

/**
 * Unit tests verifying Enterprise Readiness components.
 */
public class EnterpriseReadinessTest {

  @Before
  public function setUp() {
    AppContainer.reset()
    ClockProvider.resetToSystemClock()
  }

  @Test
  public function testAppContainerBootstrap() {
    var container = AppContainer.get()
    Assert.assertNotNull(container)

    var contactRepo = container.ContactRepository
    var vehicleRepo = container.VehicleRepository
    var policyRepo = container.PolicyRepository
    var policyHistoryRepo = container.PolicyHistoryRepository
    var claimRepo = container.ClaimRepository
    var claimHistoryRepo = container.ClaimHistoryRepository

    Assert.assertNotNull(contactRepo)
    Assert.assertNotNull(vehicleRepo)
    Assert.assertNotNull(policyRepo)
    Assert.assertNotNull(policyHistoryRepo)
    Assert.assertNotNull(claimRepo)
    Assert.assertNotNull(claimHistoryRepo)

    var policyService1 = container.PolicyService
    var policyService2 = container.PolicyService
    Assert.assertNotNull(policyService1)
    // Verify singleton lifecycle
    Assert.assertSame(policyService1, policyService2)
  }

  @Test
  public function testExceptionHierarchyAndFormatting() {
    var ex = new EntityNotFoundException("Contact not found")
    Assert.assertTrue(ex typeis PolicyFlowException)
    Assert.assertTrue(ex typeis java.lang.RuntimeException)
    Assert.assertEquals("Contact not found", ex.Message)

    var formatted = ExceptionFormatter.format(ex)
    Assert.assertTrue(formatted.contains("[EntityNotFoundException]"))
    Assert.assertTrue(formatted.contains("Contact not found"))

    var valEx = new ValidationException({"First Name is required", "Email address is invalid"})
    var valFormatted = ExceptionFormatter.format(valEx)
    Assert.assertTrue(valFormatted.contains("[ValidationException]"))
    Assert.assertTrue(valFormatted.contains("First Name is required"))
    Assert.assertTrue(valFormatted.contains("Email address is invalid"))
  }

  @Test
  public function testStructuredLogger() {
    var logger = StructuredLogger.getLogger(EnterpriseReadinessTest)
    Assert.assertNotNull(logger)

    var ctx = new HashMap<String, Object>()
    ctx.put("policyId", "POL-0001")
    ctx.put("userId", "PWC-ADMIN")

    // Verify logging executes without throwing any exceptions
    logger.info("Executing enterprise readiness log test", ctx)
    logger.warn("Simulating structural logger warning test")
    logger.error("Simulating error log entry details")
  }

  @Test
  public function testSanitizationUtil() {
    Assert.assertEquals("too many spaces", SanitizationUtil.sanitizeText("  too    many   spaces   "))
    Assert.assertEquals("nataraj@pwc.com", SanitizationUtil.sanitizeEmail("   Nataraj@PWC.CoM  "))
    Assert.assertNull(SanitizationUtil.sanitizeText(null))
    Assert.assertNull(SanitizationUtil.sanitizeEmail(null))
  }

  @Test
  public function testClockProviderVirtualization() {
    var mockDate = LocalDate.of(2030, 12, 25)
    ClockProvider.setMockClock(mockDate)

    Assert.assertEquals(mockDate, ClockProvider.nowLocalDate())

    ClockProvider.resetToSystemClock()
    Assert.assertNotEquals(mockDate, ClockProvider.nowLocalDate())
  }

  @Test
  public function testSecondaryIndexesFunctionalCorrectness() {
    var container = AppContainer.get()
    var contactRepo = container.ContactRepository
    var vehicleRepo = container.VehicleRepository
    var policyRepo = container.PolicyRepository
    var claimRepo = container.ClaimRepository

    // 1. Contact Email Index
    var contact = new Contact(ContactType.PERSON)
    contact.FirstName = "Nataraj"
    contact.LastName = "EL"
    contact.EmailAddress = "   nataraj@pwc.com   "
    contactRepo.save(contact)

    var retrievedContact = contactRepo.findByEmail("nataraj@pwc.com")
    Assert.assertNotNull(retrievedContact)
    Assert.assertEquals(contact.ID, retrievedContact.ID)

    // 2. Vehicle VIN and LicensePlate Index
    var vehicle = new Vehicle("VIN12345678901234")
    vehicle.LicensePlate = "PWC-777"
    vehicleRepo.save(vehicle)

    var retrievedVehicleVin = vehicleRepo.findByVin("vin12345678901234")
    Assert.assertNotNull(retrievedVehicleVin)
    Assert.assertEquals(vehicle.ID, retrievedVehicleVin.ID)

    var retrievedVehiclePlate = vehicleRepo.findByLicensePlate("pwc-777")
    Assert.assertNotNull(retrievedVehiclePlate)
    Assert.assertEquals(vehicle.ID, retrievedVehiclePlate.ID)

    // 3. Policy Number Index
    var policy = new Policy()
    policyRepo.save(policy)

    var retrievedPolicy = policyRepo.findByPolicyNumber(policy.PolicyNumber)
    Assert.assertNotNull(retrievedPolicy)
    Assert.assertEquals(policy.ID, retrievedPolicy.ID)

    // 4. Claim Number Index
    var claim = new Claim()
    claimRepo.save(claim)

    var retrievedClaim = claimRepo.findByClaimNumber(claim.ClaimNumber)
    Assert.assertNotNull(retrievedClaim)
    Assert.assertEquals(claim.ID, retrievedClaim.ID)

    // 5. Index cleanup on Delete
    contactRepo.delete(contact.ID)
    Assert.assertNull(contactRepo.findByEmail("nataraj@pwc.com"))
  }
}
