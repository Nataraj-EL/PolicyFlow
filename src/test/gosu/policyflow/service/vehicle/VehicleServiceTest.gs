package policyflow.service.vehicle

uses org.junit.Assert
uses org.junit.Before
uses org.junit.Test
uses policyflow.domain.vehicle.Vehicle
uses policyflow.domain.vehicle.VehicleType
uses policyflow.domain.vehicle.FuelType
uses policyflow.repository.vehicle.InMemoryVehicleRepository
uses policyflow.validation.ValidationException
uses java.util.UUID

/**
 * Unit tests for {@link VehicleService} and {@link VehicleServiceImpl}.
 */
public class VehicleServiceTest {
  private var _repository : InMemoryVehicleRepository
  private var _service : VehicleServiceImpl

  @Before
  public function setUp() {
    _repository = new InMemoryVehicleRepository()
    _service = new VehicleServiceImpl(_repository)
  }

  @Test
  public function testCreateVehicleSuccessful() {
    var vehicle = new Vehicle("1FM5K8F88HGA12345")
    vehicle.Make = "Ford"
    vehicle.Model = "Explorer"
    vehicle.ManufactureYear = 2017
    vehicle.Color = "Black"
    vehicle.LicensePlate = "XYZ-1234"
    vehicle.VehicleType = VehicleType.SUV
    vehicle.FuelType = FuelType.GASOLINE

    var saved = _service.createVehicle(vehicle)
    Assert.assertNotNull(saved)
    Assert.assertNotNull(saved.ID)
    Assert.assertEquals("1FM5K8F88HGA12345", saved.VIN)
    Assert.assertEquals("Ford", saved.Make)

    var retrieved = _service.getVehicle(saved.ID)
    Assert.assertEquals(saved, retrieved)
  }

  @Test
  public function testCreateVehicleValidationFailureThrowsException() {
    var vehicle = new Vehicle()
    vehicle.VIN = "12345" // Invalid length
    vehicle.ManufactureYear = 1899 // Out of range

    try {
      _service.createVehicle(vehicle)
      Assert.fail("Expected ValidationException to be thrown")
    } catch (e : ValidationException) {
      Assert.assertTrue(e.Errors.size() > 0)
      Assert.assertTrue(e.Errors.contains("VIN must be exactly 17 characters long. Current length: 5"))
      Assert.assertTrue(e.Errors.contains("Make is required."))
      Assert.assertTrue(e.Errors.contains("Model is required."))
      Assert.assertTrue(e.Errors.contains("Manufacture Year must be between 1900 and 2027. Current: 1899"))
      Assert.assertTrue(e.Errors.contains("Vehicle Type is required."))
      Assert.assertTrue(e.Errors.contains("Fuel Type is required."))
    }
  }

  @Test
  public function testCreateVehicleDuplicateVinThrowsException() {
    var vehicle1 = new Vehicle("1FM5K8F88HGA12345")
    vehicle1.Make = "Ford"
    vehicle1.Model = "Explorer"
    vehicle1.ManufactureYear = 2017
    vehicle1.VehicleType = VehicleType.SUV
    vehicle1.FuelType = FuelType.GASOLINE
    _service.createVehicle(vehicle1)

    var vehicle2 = new Vehicle("1FM5K8F88HGA12345") // Duplicate VIN
    vehicle2.Make = "Chevrolet"
    vehicle2.Model = "Tahoe"
    vehicle2.ManufactureYear = 2020
    vehicle2.VehicleType = VehicleType.SUV
    vehicle2.FuelType = FuelType.GASOLINE

    try {
      _service.createVehicle(vehicle2)
      Assert.fail("Expected IllegalArgumentException due to duplicate VIN")
    } catch (e : IllegalArgumentException) {
      Assert.assertTrue(e.Message.contains("VIN already in use"))
    }
  }

  @Test
  public function testCreateVehicleDuplicateLicensePlateThrowsException() {
    var vehicle1 = new Vehicle("1FM5K8F88HGA12345")
    vehicle1.Make = "Ford"
    vehicle1.Model = "Explorer"
    vehicle1.ManufactureYear = 2017
    vehicle1.LicensePlate = "XYZ-1234"
    vehicle1.VehicleType = VehicleType.SUV
    vehicle1.FuelType = FuelType.GASOLINE
    _service.createVehicle(vehicle1)

    var vehicle2 = new Vehicle("1G1YY26U475112345")
    vehicle2.Make = "Chevrolet"
    vehicle2.Model = "Corvette"
    vehicle2.ManufactureYear = 2021
    vehicle2.LicensePlate = "XYZ-1234" // Duplicate License Plate
    vehicle2.VehicleType = VehicleType.COUPE
    vehicle2.FuelType = FuelType.GASOLINE

    try {
      _service.createVehicle(vehicle2)
      Assert.fail("Expected IllegalArgumentException due to duplicate License Plate")
    } catch (e : IllegalArgumentException) {
      Assert.assertTrue(e.Message.contains("License Plate already in use"))
    }
  }

  @Test
  public function testUpdateVehicleSuccessful() {
    var vehicle = new Vehicle("1FM5K8F88HGA12345")
    vehicle.Make = "Ford"
    vehicle.Model = "Explorer"
    vehicle.ManufactureYear = 2017
    vehicle.VehicleType = VehicleType.SUV
    vehicle.FuelType = FuelType.GASOLINE
    var saved = _service.createVehicle(vehicle)

    saved.Color = "Red"
    var updated = _service.updateVehicle(saved)
    Assert.assertEquals("Red", updated.Color)

    var retrieved = _service.getVehicle(saved.ID)
    Assert.assertEquals("Red", retrieved.Color)
  }

  @Test
  public function testUpdateAllowsSameVinAndLicensePlate() {
    var vehicle = new Vehicle("1FM5K8F88HGA12345")
    vehicle.Make = "Ford"
    vehicle.Model = "Explorer"
    vehicle.ManufactureYear = 2017
    vehicle.LicensePlate = "XYZ-1234"
    vehicle.VehicleType = VehicleType.SUV
    vehicle.FuelType = FuelType.GASOLINE
    var saved = _service.createVehicle(vehicle)

    saved.Color = "Blue"
    var updated = _service.updateVehicle(saved)
    Assert.assertEquals("Blue", updated.Color)
  }

  @Test
  public function testUpdateDuplicateVinThrowsException() {
    var vehicle1 = new Vehicle("1FM5K8F88HGA12345")
    vehicle1.Make = "Ford"
    vehicle1.Model = "Explorer"
    vehicle1.ManufactureYear = 2017
    vehicle1.VehicleType = VehicleType.SUV
    vehicle1.FuelType = FuelType.GASOLINE
    _service.createVehicle(vehicle1)

    var vehicle2 = new Vehicle("1G1YY26U475112345")
    vehicle2.Make = "Chevrolet"
    vehicle2.Model = "Corvette"
    vehicle2.ManufactureYear = 2021
    vehicle2.VehicleType = VehicleType.COUPE
    vehicle2.FuelType = FuelType.GASOLINE
    var saved2 = _service.createVehicle(vehicle2)

    // Update vehicle2's VIN to match vehicle1
    saved2.VIN = "1FM5K8F88HGA12345"

    try {
      _service.updateVehicle(saved2)
      Assert.fail("Expected IllegalArgumentException due to duplicate VIN on update")
    } catch (e : IllegalArgumentException) {
      Assert.assertTrue(e.Message.contains("VIN already in use"))
    }
  }

  @Test
  public function testUpdateDuplicateLicensePlateThrowsException() {
    var vehicle1 = new Vehicle("1FM5K8F88HGA12345")
    vehicle1.Make = "Ford"
    vehicle1.Model = "Explorer"
    vehicle1.ManufactureYear = 2017
    vehicle1.LicensePlate = "PLATE1"
    vehicle1.VehicleType = VehicleType.SUV
    vehicle1.FuelType = FuelType.GASOLINE
    _service.createVehicle(vehicle1)

    var vehicle2 = new Vehicle("1G1YY26U475112345")
    vehicle2.Make = "Chevrolet"
    vehicle2.Model = "Corvette"
    vehicle2.ManufactureYear = 2021
    vehicle2.LicensePlate = "PLATE2"
    vehicle2.VehicleType = VehicleType.COUPE
    vehicle2.FuelType = FuelType.GASOLINE
    var saved2 = _service.createVehicle(vehicle2)

    // Update vehicle2's License Plate to match vehicle1
    saved2.LicensePlate = "PLATE1"

    try {
      _service.updateVehicle(saved2)
      Assert.fail("Expected IllegalArgumentException due to duplicate License Plate on update")
    } catch (e : IllegalArgumentException) {
      Assert.assertTrue(e.Message.contains("License Plate already in use"))
    }
  }

  @Test
  public function testDeleteVehicleSuccessful() {
    var vehicle = new Vehicle("1FM5K8F88HGA12345")
    vehicle.Make = "Ford"
    vehicle.Model = "Explorer"
    vehicle.ManufactureYear = 2017
    vehicle.VehicleType = VehicleType.SUV
    vehicle.FuelType = FuelType.GASOLINE
    var saved = _service.createVehicle(vehicle)

    Assert.assertNotNull(_service.getVehicle(saved.ID))

    _service.deleteVehicle(saved.ID)

    var retrieved = _service.getVehicle(saved.ID)
    Assert.assertNull(retrieved)
  }

  @Test
  public function testSearchVehicles() {
    var vehicle1 = new Vehicle("1FM5K8F88HGA12345")
    vehicle1.Make = "Toyota"
    vehicle1.Model = "Camry"
    vehicle1.ManufactureYear = 2018
    vehicle1.VehicleType = VehicleType.SEDAN
    vehicle1.FuelType = FuelType.GASOLINE
    _service.createVehicle(vehicle1)

    var vehicle2 = new Vehicle("1G1YY26U475112345")
    vehicle2.Make = "Toyota"
    vehicle2.Model = "Rav4"
    vehicle2.ManufactureYear = 2020
    vehicle2.VehicleType = VehicleType.SUV
    vehicle2.FuelType = FuelType.HYBRID
    _service.createVehicle(vehicle2)

    var vehicle3 = new Vehicle("1HGCR2F88HA123456")
    vehicle3.Make = "Honda"
    vehicle3.Model = "Accord"
    vehicle3.ManufactureYear = 2019
    vehicle3.VehicleType = VehicleType.SEDAN
    vehicle3.FuelType = FuelType.GASOLINE
    _service.createVehicle(vehicle3)

    // Search by Make
    var results = _service.searchVehicles("toyota", null, null)
    Assert.assertEquals(2, results.size()) // Camry & Rav4

    // Search by Model
    results = _service.searchVehicles(null, "cam", null)
    Assert.assertEquals(1, results.size()) // Camry

    // Search by Type
    results = _service.searchVehicles(null, null, VehicleType.SEDAN)
    Assert.assertEquals(2, results.size()) // Camry & Accord

    // Search by Make, Model & Type
    results = _service.searchVehicles("Toyota", "Camry", VehicleType.SEDAN)
    Assert.assertEquals(1, results.size()) // Camry only
  }
}
