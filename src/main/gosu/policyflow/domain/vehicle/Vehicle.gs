package policyflow.domain.vehicle

uses java.util.UUID

/**
 * Represents a Vehicle risk entity in PolicyFlow.
 * Each vehicle is uniquely identified by an immutable {@link java.util.UUID} ID
 * and possesses validation attributes like a 17-character VIN.
 */
public class Vehicle {
  private var _id : UUID as readonly ID
  private var _vin : String as VIN
  private var _make : String as Make
  private var _model : String as Model
  private var _manufactureYear : int as ManufactureYear
  private var _color : String as Color
  private var _licensePlate : String as LicensePlate
  private var _vehicleType : VehicleType as VehicleType
  private var _fuelType : FuelType as FuelType

  /**
   * Constructs a Vehicle with an auto-generated unique identifier.
   */
  public construct() {
    _id = UUID.randomUUID()
  }

  /**
   * Constructs a Vehicle with a specified VIN and auto-generated unique identifier.
   * 
   * @param vin The 17-character Vehicle Identification Number.
   */
  public construct(vin : String) {
    _id = UUID.randomUUID()
    _vin = vin
  }
}
