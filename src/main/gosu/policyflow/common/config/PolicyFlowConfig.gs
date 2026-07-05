package policyflow.common.config

uses java.math.BigDecimal

/**
 * Central configuration manager defining global constants and rule settings.
 */
public class PolicyFlowConfig {
  // --- Rating Rule Constants ---
  /**
   * Base premium amount for personal auto lines.
   */
  public static final var BASE_PREMIUM_PERSONAL_AUTO : BigDecimal = new BigDecimal("5000.00")

  /**
   * Base premium amount for commercial auto lines.
   */
  public static final var BASE_PREMIUM_COMMERCIAL_AUTO : BigDecimal = new BigDecimal("10000.00")

  /**
   * Default state tax rate (8%).
   */
  public static final var DEFAULT_STATE_TAX_RATE : BigDecimal = new BigDecimal("0.08") // 8%

  /**
   * Default logging level.
   */
  public static final var DEFAULT_LOG_LEVEL : String = "INFO"

  /**
   * Threshold age of vehicle when risk multiplier kicks in.
   */
  public static final var VEHICLE_AGE_RISK_THRESHOLD_YEARS : int = 5
}
