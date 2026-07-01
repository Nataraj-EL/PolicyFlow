package policyflow.repository.vehicle

uses policyflow.domain.vehicle.Vehicle
uses java.util.List
uses java.util.UUID

/**
 * Data access interface for managing Vehicle entities in PolicyFlow.
 */
public interface VehicleRepository {
  /**
   * Saves or updates a vehicle in the data store.
   * 
   * @param vehicle The vehicle to save.
   * @return The saved vehicle instance.
   */
  public function save(vehicle : Vehicle) : Vehicle

  /**
   * Finds a vehicle by its unique UUID.
   * 
   * @param id The unique identifier of the vehicle.
   * @return The vehicle if found, null otherwise.
   */
  public function findById(id : UUID) : Vehicle

  /**
   * Finds a vehicle by its unique 17-character VIN.
   * 
   * @param vin The Vehicle Identification Number.
   * @return The vehicle if found, null otherwise.
   */
  public function findByVin(vin : String) : Vehicle

  /**
   * Finds all vehicles in the system.
   * 
   * @return A list of all vehicles.
   */
  public function findAll() : List<Vehicle>

  /**
   * Deletes a vehicle from the data store by its UUID.
   * 
   * @param id The unique identifier of the vehicle.
   * @return true if the vehicle was found and deleted, false otherwise.
   */
  public function delete(id : UUID) : boolean

  /**
   * Clears all vehicles from the data store.
   */
  public function clear() : void
}
