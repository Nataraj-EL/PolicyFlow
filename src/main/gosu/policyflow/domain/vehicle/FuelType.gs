package policyflow.domain.vehicle

/**
 * Represents the engine fuel type of a vehicle.
 */
public enum FuelType {
  /**
   * Standard gasoline engine.
   */
  GASOLINE,

  /**
   * Diesel oil engine.
   */
  DIESEL,

  /**
   * Battery-electric motor (EV).
   */
  ELECTRIC,

  /**
   * Combined internal combustion and electric motor.
   */
  HYBRID
}
