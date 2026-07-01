package policyflow.service.vehicle

uses policyflow.domain.vehicle.Vehicle
uses policyflow.domain.vehicle.VehicleType
uses java.util.List
uses java.util.UUID

/**
 * Service interface for managing Vehicle lifecycle workflows.
 */
public interface VehicleService {
  /**
   * Validates and creates a new Vehicle in the persistence store.
   * Enforces VIN and License Plate uniqueness constraints globally.
   * 
   * @param vehicle The vehicle object to create.
   * @return The created vehicle instance.
   * @throws IllegalArgumentException if validation fails or a duplicate VIN/License Plate is detected.
   */
  public function createVehicle(vehicle : Vehicle) : Vehicle

  /**
   * Retrieves a vehicle by its unique UUID.
   * 
   * @param id The unique identifier of the vehicle.
   * @return The vehicle if found, null otherwise.
   */
  public function getVehicle(id : UUID) : Vehicle

  /**
   * Retrieves a vehicle by its unique 17-character VIN.
   * 
   * @param vin The Vehicle Identification Number.
   * @return The vehicle if found, null otherwise.
   */
  public function getVehicleByVin(vin : String) : Vehicle

  /**
   * Returns a list of all vehicles currently registered.
   * 
   * @return A list of all vehicles.
   */
  public function getAllVehicles() : List<Vehicle>

  /**
   * Validates and updates the details of an existing vehicle.
   * Enforces ID immutability and duplicate checks for other records.
   * 
   * @param vehicle The vehicle details to update.
   * @return The updated vehicle instance.
   * @throws IllegalArgumentException if the vehicle is not found, validation fails, or unique constraint is breached.
   */
  public function updateVehicle(vehicle : Vehicle) : Vehicle

  /**
   * Deletes a vehicle by its unique UUID.
   * 
   * @param id The unique identifier of the vehicle.
   * @throws IllegalArgumentException if the vehicle is not found.
   */
  public function deleteVehicle(id : UUID) : void

  /**
   * Searches vehicles by make, model, and/or vehicle type.
   * Filters are applied as an AND condition if multiple criteria are present.
   * - Make: Case-insensitive substring matching.
   * - Model: Case-insensitive substring matching.
   * - VehicleType: Exact match.
   * 
   * @param makeQuery The vehicle make query (optional).
   * @param modelQuery The vehicle model query (optional).
   * @param typeFilter The vehicle type filter (optional).
   * @return A list of matching vehicles.
   */
  public function searchVehicles(makeQuery : String, modelQuery : String, typeFilter : VehicleType) : List<Vehicle>
}
