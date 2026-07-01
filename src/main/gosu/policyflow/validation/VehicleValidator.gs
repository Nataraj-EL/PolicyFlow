package policyflow.validation

uses policyflow.domain.vehicle.Vehicle
uses java.util.Calendar

/**
 * Validator class for enforcing Vehicle domain invariants and Personal Auto business rules.
 */
public class VehicleValidator {

  /**
   * Validates a Vehicle entity's state, returning errors or warnings.
   * 
   * @param vehicle The vehicle to validate.
   * @return A ValidationResult containing validation feedback.
   */
  public static function validate(vehicle : Vehicle) : ValidationResult {
    var result = new ValidationResult()

    if (vehicle == null) {
      result.addError("Vehicle cannot be null.")
      return result
    }

    // 1. VIN Validation
    var vin = vehicle.VIN
    if (vin == null || vin.trim().isEmpty()) {
      result.addError("VIN is required.")
    } else {
      var vinClean = vin.trim()
      if (vinClean.length() != 17) {
        result.addError("VIN must be exactly 17 characters long. Current length: " + vinClean.length())
      }
      // Alphanumeric check
      if (!vinClean.matches("^[A-Za-z0-9]+$")) {
        result.addError("VIN must be alphanumeric.")
      }
    }

    // 2. Make and Model Validation
    if (vehicle.Make == null || vehicle.Make.trim().isEmpty()) {
      result.addError("Make is required.")
    }
    if (vehicle.Model == null || vehicle.Model.trim().isEmpty()) {
      result.addError("Model is required.")
    }

    // 3. Manufacture Year Validation
    var currentYear = Calendar.getInstance().get(Calendar.YEAR)
    var maxYear = currentYear + 1
    if (vehicle.ManufactureYear < 1900 || vehicle.ManufactureYear > maxYear) {
      result.addError("Manufacture Year must be between 1900 and " + maxYear + ". Current: " + vehicle.ManufactureYear)
    }

    // 4. Vehicle Type and Fuel Type Validation
    if (vehicle.VehicleType == null) {
      result.addError("Vehicle Type is required.")
    }
    if (vehicle.FuelType == null) {
      result.addError("Fuel Type is required.")
    }

    // 5. License Plate Validation (if provided, must be non-empty)
    var plate = vehicle.LicensePlate
    if (plate != null && plate.trim().isEmpty()) {
      result.addError("License Plate cannot be empty if specified.")
    }

    return result
  }
}
