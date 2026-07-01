package policyflow.domain.rating

uses java.math.BigDecimal

/**
 * Model class detailing individual items contributing to a final calculated premium.
 * Uses {@link java.math.BigDecimal} exclusively for financial calculations.
 */
public class PremiumBreakdown {
  private var _basePremium : BigDecimal as BasePremium = BigDecimal.ZERO
  private var _vehicleTypeAdjustment : BigDecimal as VehicleTypeAdjustment = BigDecimal.ZERO
  private var _vehicleAgeAdjustment : BigDecimal as VehicleAgeAdjustment = BigDecimal.ZERO
  private var _fuelTypeAdjustment : BigDecimal as FuelTypeAdjustment = BigDecimal.ZERO
  private var _contactTypeAdjustment : BigDecimal as ContactTypeAdjustment = BigDecimal.ZERO
  private var _tax : BigDecimal as Tax = BigDecimal.ZERO
  private var _totalPremium : BigDecimal as TotalPremium = BigDecimal.ZERO

  /**
   * Constructs an empty PremiumBreakdown with values initialized to zero.
   */
  public construct() {}
}
