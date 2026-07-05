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
    assertBigDecimalEquals(new BigDecimal("10000.00"), breakdown.BasePremium)
    assertBigDecimalEquals(new BigDecimal("0.00"), breakdown.VehicleTypeAdjustment)
    assertBigDecimalEquals(new BigDecimal("0.00"), breakdown.VehicleAgeAdjustment)
    assertBigDecimalEquals(new BigDecimal("0.00"), breakdown.FuelTypeAdjustment)
    assertBigDecimalEquals(new BigDecimal("0.00"), breakdown.ContactTypeAdjustment)
    assertBigDecimalEquals(new BigDecimal("800.00"), breakdown.Tax) // 10000 * 0.08
    assertBigDecimalEquals(new BigDecimal("10800.00"), breakdown.TotalPremium)
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
    assertBigDecimalEquals(new BigDecimal("10000.00"), breakdown.BasePremium)
    assertBigDecimalEquals(new BigDecimal("2000.00"), breakdown.VehicleTypeAdjustment) // SUV
    assertBigDecimalEquals(new BigDecimal("2000.00"), breakdown.VehicleAgeAdjustment) // New car surcharge
    assertBigDecimalEquals(new BigDecimal("-1000.00"), breakdown.FuelTypeAdjustment) // Electric discount
    assertBigDecimalEquals(new BigDecimal("2000.00"), breakdown.ContactTypeAdjustment) // Company commercial risk
    // Subtotal: 10000 + 2000 + 2000 - 1000 + 2000 = 15000
    assertBigDecimalEquals(new BigDecimal("1200.00"), breakdown.Tax) // 15000 * 0.08
    assertBigDecimalEquals(new BigDecimal("16200.00"), breakdown.TotalPremium) // 15000 + 1200
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
    assertBigDecimalEquals(new BigDecimal("10000.00"), breakdown.BasePremium)
    assertBigDecimalEquals(new BigDecimal("4000.00"), breakdown.VehicleTypeAdjustment) // Coupe
    assertBigDecimalEquals(new BigDecimal("1000.00"), breakdown.VehicleAgeAdjustment) // Old car risk
    assertBigDecimalEquals(new BigDecimal("-500.00"), breakdown.FuelTypeAdjustment) // Hybrid discount
    assertBigDecimalEquals(new BigDecimal("0.00"), breakdown.ContactTypeAdjustment) // Person
    // Subtotal: 10000 + 4000 + 1000 - 500 + 0 = 14500
    assertBigDecimalEquals(new BigDecimal("1160.00"), breakdown.Tax) // 14500 * 0.08
    assertBigDecimalEquals(new BigDecimal("15660.00"), breakdown.TotalPremium) // 14500 + 1160
  }

  @Test
  public function testCustomCalculatorStrategy() {
    var contact = new Contact(ContactType.PERSON)
    var vehicle = new Vehicle("1FM5K8F88HGA12345")

    // Set up a custom calculator with only the BasePremiumRule
    var rules = new ArrayList<RatingRule>()
    rules.add(new BasePremiumRule(new BigDecimal("7000.00")))

    var customCalculator = new PremiumCalculator(rules)
    var customService = new PremiumCalculationServiceImpl(customCalculator)

    var breakdown = customService.calculatePremium(vehicle, contact)
    assertBigDecimalEquals(new BigDecimal("7000.00"), breakdown.BasePremium)
    assertBigDecimalEquals(new BigDecimal("0.00"), breakdown.Tax)
    assertBigDecimalEquals(new BigDecimal("7000.00"), breakdown.TotalPremium)
  }

  private function assertBigDecimalEquals(expected : BigDecimal, actual : BigDecimal) {
    if (expected == null || actual == null) {
      Assert.assertEquals(expected, actual)
    } else {
      Assert.assertTrue("Expected <" + expected + "> but was <" + actual + ">", expected.compareTo(actual) == 0)
    }
  }
}
