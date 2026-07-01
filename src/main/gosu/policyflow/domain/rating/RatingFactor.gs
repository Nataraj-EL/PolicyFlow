package policyflow.domain.rating

/**
 * Represents the distinct dimensions contributing to a premium calculation.
 */
public enum RatingFactor {
  /**
   * Starting baseline premium.
   */
  BASE_PREMIUM,

  /**
   * Adjustment based on vehicle body style (e.g. sedan vs coupe).
   */
  VEHICLE_TYPE,

  /**
   * Adjustment based on vehicle age.
   */
  VEHICLE_AGE,

  /**
   * Adjustment or discount based on fuel type (e.g. electric vehicle discounts).
   */
  FUEL_TYPE,

  /**
   * Adjustment based on contact classification (e.g. person vs company risk).
   */
  CONTACT_TYPE,

  /**
   * Government or state tax rate.
   */
  STATE_TAX
}
