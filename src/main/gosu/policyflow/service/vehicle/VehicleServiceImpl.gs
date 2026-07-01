package policyflow.service.vehicle

uses policyflow.domain.vehicle.Vehicle
uses policyflow.domain.vehicle.VehicleType
uses policyflow.repository.vehicle.VehicleRepository
uses policyflow.validation.VehicleValidator
uses policyflow.validation.ValidationException
uses java.util.ArrayList
uses java.util.List
uses java.util.UUID

/**
 * Service implementation for managing Vehicle lifecycle workflows.
 */
public class VehicleServiceImpl implements VehicleService {
  private var _repository : VehicleRepository

  /**
   * Constructs the service with its repository dependency.
   * 
   * @param repository Data access repository for vehicles.
   */
  public construct(repository : VehicleRepository) {
    if (repository == null) {
      throw new IllegalArgumentException("VehicleRepository cannot be null")
    }
    _repository = repository
  }

  override function createVehicle(vehicle : Vehicle) : Vehicle {
    if (vehicle == null) {
      throw new IllegalArgumentException("Vehicle cannot be null")
    }

    // Run business validation
    var valResult = VehicleValidator.validate(vehicle)
    if (!valResult.Success) {
      throw new ValidationException(valResult.Errors)
    }

    // Duplicate VIN check
    var duplicateVin = findDuplicateVin(vehicle.VIN, null)
    if (duplicateVin) {
      throw new IllegalArgumentException("VIN already in use: " + vehicle.VIN)
    }

    // Duplicate License Plate check
    var plate = vehicle.LicensePlate
    if (plate != null && !plate.trim().isEmpty()) {
      var duplicatePlate = findDuplicateLicensePlate(plate, null)
      if (duplicatePlate) {
        throw new IllegalArgumentException("License Plate already in use: " + plate)
      }
    }

    return _repository.save(vehicle)
  }

  override function getVehicle(id : UUID) : Vehicle {
    if (id == null) {
      throw new IllegalArgumentException("Vehicle ID cannot be null")
    }
    return _repository.findById(id)
  }

  override function getVehicleByVin(vin : String) : Vehicle {
    if (vin == null || vin.trim().isEmpty()) {
      throw new IllegalArgumentException("VIN cannot be empty")
    }
    return _repository.findByVin(vin)
  }

  override function getAllVehicles() : List<Vehicle> {
    return _repository.findAll()
  }

  override function updateVehicle(vehicle : Vehicle) : Vehicle {
    if (vehicle == null) {
      throw new IllegalArgumentException("Vehicle cannot be null")
    }
    if (vehicle.ID == null) {
      throw new IllegalArgumentException("Vehicle ID cannot be null")
    }

    // Verify vehicle exists
    var existing = _repository.findById(vehicle.ID)
    if (existing == null) {
      throw new IllegalArgumentException("Vehicle not found with ID: " + vehicle.ID)
    }

    // Run business validation
    var valResult = VehicleValidator.validate(vehicle)
    if (!valResult.Success) {
      throw new ValidationException(valResult.Errors)
    }

    // Duplicate VIN check (excluding current vehicle)
    var duplicateVin = findDuplicateVin(vehicle.VIN, vehicle.ID)
    if (duplicateVin) {
      throw new IllegalArgumentException("VIN already in use: " + vehicle.VIN)
    }

    // Duplicate License Plate check (excluding current vehicle)
    var plate = vehicle.LicensePlate
    if (plate != null && !plate.trim().isEmpty()) {
      var duplicatePlate = findDuplicateLicensePlate(plate, vehicle.ID)
      if (duplicatePlate) {
        throw new IllegalArgumentException("License Plate already in use: " + plate)
      }
    }

    return _repository.save(vehicle)
  }

  override function deleteVehicle(id : UUID) {
    if (id == null) {
      throw new IllegalArgumentException("Vehicle ID cannot be null")
    }

    var existing = _repository.findById(id)
    if (existing == null) {
      throw new IllegalArgumentException("Vehicle not found with ID: " + id)
    }

    _repository.delete(id)
  }

  override function searchVehicles(makeQuery : String, modelQuery : String, typeFilter : VehicleType) : List<Vehicle> {
    var results = _repository.findAll()

    var makeClean = (makeQuery != null) ? makeQuery.trim().toLowerCase() : ""
    var modelClean = (modelQuery != null) ? modelQuery.trim().toLowerCase() : ""

    if (!makeClean.isEmpty()) {
      var temp = new ArrayList<Vehicle>()
      for (v in results) {
        var make = v.Make ?: ""
        if (make.toLowerCase().contains(makeClean)) {
          temp.add(v)
        }
      }
      results = temp
    }

    if (!modelClean.isEmpty()) {
      var temp = new ArrayList<Vehicle>()
      for (v in results) {
        var model = v.Model ?: ""
        if (model.toLowerCase().contains(modelClean)) {
          temp.add(v)
        }
      }
      results = temp
    }

    if (typeFilter != null) {
      var temp = new ArrayList<Vehicle>()
      for (v in results) {
        if (v.VehicleType == typeFilter) {
          temp.add(v)
        }
      }
      results = temp
    }

    return results
  }

  /**
   * Helper function to detect duplicate VIN usage.
   * 
   * @param vin VIN to search.
   * @param excludeId ID to exclude from match (for updates).
   * @return true if duplicate VIN is found, false otherwise.
   */
  private function findDuplicateVin(vin : String, excludeId : UUID) : boolean {
    var cleanVin = vin.trim().toLowerCase()
    for (v in _repository.findAll()) {
      if (excludeId == null || !v.ID.equals(excludeId)) {
        var currentVin = v.VIN ?: ""
        if (currentVin.trim().toLowerCase().equals(cleanVin)) {
          return true
        }
      }
    }
    return false
  }

  /**
   * Helper function to detect duplicate License Plate usage.
   * 
   * @param plate License plate to search.
   * @param excludeId ID to exclude from match (for updates).
   * @return true if duplicate license plate is found, false otherwise.
   */
  private function findDuplicateLicensePlate(plate : String, excludeId : UUID) : boolean {
    var cleanPlate = plate.trim().toLowerCase()
    for (v in _repository.findAll()) {
      if (excludeId == null || !v.ID.equals(excludeId)) {
        var currentPlate = v.LicensePlate ?: ""
        if (currentPlate.trim().toLowerCase().equals(cleanPlate)) {
          return true
        }
      }
    }
    return false
  }
}
