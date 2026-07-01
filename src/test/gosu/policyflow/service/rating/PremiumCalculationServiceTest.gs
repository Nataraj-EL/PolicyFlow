package policyflow.service.rating

uses org.junit.Assert
uses org.junit.Before
uses org.junit.Test
uses policyflow.domain.vehicle.Vehicle
uses policyflow.domain.vehicle.VehicleType
uses policyflow.domain.vehicle.FuelType
uses policyflow.domain.account.Contact
uses policyflow.domain.account.ContactType
uses policyflow.domain.account.Address
uses policyflow.domain.rating.PremiumBreakdown
uses policyflow.rating.PremiumCalculator
uses policyflow.rating.BasePremiumRule
uses policyflow.rating.RatingRule
uses java.math.BigDecimal
uses java.time.LocalDate
uses java.util.ArrayList

/**
 * Unit tests for {@link PremiumCalculationService} and {@link PremiumCalculationServiceImpl}.
 */
public class PremiumCalculationServiceTest {
  private var _service : PremiumCalculationServiceImpl
  private var _referenceYear : int

  @Before
  public function setUp() {
    _service = new PremiumCalculationServiceImpl()
    _referenceYear = LocalDate.now().getYear()
  }

  @Test
  public function testCalculatePremiumStandardPerson() {
    var contact = new Contact(ContactType.PERSON)
    contact.FirstName = "Nataraj"
    contact.LastName = "EL"
    contact.EmailAddress = "nataraj@pwc.com"
    contact.PrimaryAddress = new Address("123 PwC Way", null, "New York", "NY", "10001", "USA")

    // Sedan, 5 years old, Gasoline, Person
    var vehicle = new Vehicle("1FM5K8F88HGA12345")
    vehicle.Make = "Toyota"
    vehicle.Model = "Camry"
    vehicle.ManufactureYear = _referenceYear - 5
    vehicle.VehicleType = VehicleType.SEDAN
    vehicle.FuelType = FuelType.GASOLINE

    var breakdown = _service.calculatePremium(vehicle, contact)

    Assert.assertNotNull(breakdown)
    assertBigDecimalEquals(new BigDecimal("500.00"), breakdown.BasePremium)
    assertBigDecimalEquals(new BigDecimal("0.00"), breakdown.VehicleTypeAdjustment)
    assertBigDecimalEquals(new BigDecimal("0.00"), breakdown.VehicleAgeAdjustment)
    assertBigDecimalEquals(new BigDecimal("0.00"), breakdown.FuelTypeAdjustment)
    assertBigDecimalEquals(new BigDecimal("0.00"), breakdown.ContactTypeAdjustment)
    assertBigDecimalEquals(new BigDecimal("40.00"), breakdown.Tax) // 500 * 0.08
    assertBigDecimalEquals(new BigDecimal("540.00"), breakdown.TotalPremium)
  }

  @Test
  public function testCalculatePremiumNewSUVCompanyEV() {
    var contact = new Contact(ContactType.COMPANY)
    contact.CompanyName = "PwC LLC"
    contact.PrimaryAddress = new Address("300 Madison Ave", null, "New York", "NY", "10017", "USA")

    // SUV, 1 year old (New), Electric, Company
    var vehicle = new Vehicle("1FM5K8F88HGA12345")
    vehicle.Make = "Tesla"
    vehicle.Model = "Model Y"
    vehicle.ManufactureYear = _referenceYear - 1
    vehicle.VehicleType = VehicleType.SUV
    vehicle.FuelType = FuelType.ELECTRIC

    var breakdown = _service.calculatePremium(vehicle, contact)

    Assert.assertNotNull(breakdown)
    assertBigDecimalEquals(new BigDecimal("500.00"), breakdown.BasePremium)
    assertBigDecimalEquals(new BigDecimal("100.00"), breakdown.VehicleTypeAdjustment) // SUV
    assertBigDecimalEquals(new BigDecimal("100.00"), breakdown.VehicleAgeAdjustment) // New car surcharge
    assertBigDecimalEquals(new BigDecimal("-50.00"), breakdown.FuelTypeAdjustment) // Electric discount
    assertBigDecimalEquals(new BigDecimal("100.00"), breakdown.ContactTypeAdjustment) // Company commercial risk
    // Subtotal: 500 + 100 + 100 - 50 + 100 = 750
    assertBigDecimalEquals(new BigDecimal("60.00"), breakdown.Tax) // 750 * 0.08
    assertBigDecimalEquals(new BigDecimal("810.00"), breakdown.TotalPremium) // 750 + 60
  }

  @Test
  public function testCalculatePremiumOldCoupeHybridPerson() {
    var contact = new Contact(ContactType.PERSON)
    contact.FirstName = "Nataraj"
    contact.LastName = "EL"
    contact.PrimaryAddress = new Address("123 PwC Way", null, "New York", "NY", "10001", "USA")

    // Coupe, 12 years old (Old), Hybrid, Person
    var vehicle = new Vehicle("1FM5K8F88HGA12345")
    vehicle.Make = "Honda"
    vehicle.Model = "Accord Coupe"
    vehicle.ManufactureYear = _referenceYear - 12
    vehicle.VehicleType = VehicleType.COUPE
    vehicle.FuelType = FuelType.HYBRID

    var breakdown = _service.calculatePremium(vehicle, contact)

    Assert.assertNotNull(breakdown)
    assertBigDecimalEquals(new BigDecimal("500.00"), breakdown.BasePremium)
    assertBigDecimalEquals(new BigDecimal("200.00"), breakdown.VehicleTypeAdjustment) // Coupe
    assertBigDecimalEquals(new BigDecimal("50.00"), breakdown.VehicleAgeAdjustment) // Old car risk
    assertBigDecimalEquals(new BigDecimal("-25.00"), breakdown.FuelTypeAdjustment) // Hybrid discount
    assertBigDecimalEquals(new BigDecimal("0.00"), breakdown.ContactTypeAdjustment) // Person
    // Subtotal: 500 + 200 + 50 - 25 + 0 = 725
    assertBigDecimalEquals(new BigDecimal("58.00"), breakdown.Tax) // 725 * 0.08
    assertBigDecimalEquals(new BigDecimal("783.00"), breakdown.TotalPremium) // 725 + 58
  }

  @Test
  public function testCustomCalculatorStrategy() {
    var contact = new Contact(ContactType.PERSON)
    var vehicle = new Vehicle("1FM5K8F88HGA12345")

    // Set up a custom calculator with only the BasePremiumRule
    var rules = new ArrayList<RatingRule>()
    rules.add(new BasePremiumRule(new BigDecimal("350.00")))

    var customCalculator = new PremiumCalculator(rules)
    var customService = new PremiumCalculationServiceImpl(customCalculator)

    var breakdown = customService.calculatePremium(vehicle, contact)
    assertBigDecimalEquals(new BigDecimal("350.00"), breakdown.BasePremium)
    assertBigDecimalEquals(new BigDecimal("0.00"), breakdown.Tax)
    assertBigDecimalEquals(new BigDecimal("350.00"), breakdown.TotalPremium)
  }

  private function assertBigDecimalEquals(expected : BigDecimal, actual : BigDecimal) {
    if (expected == null || actual == null) {
      Assert.assertEquals(expected, actual)
    } else {
      Assert.assertTrue("Expected <" + expected + "> but was <" + actual + ">", expected.compareTo(actual) == 0)
    }
  }
}
