package policyflow.rating

uses policyflow.domain.vehicle.Vehicle
uses policyflow.domain.account.Contact
uses policyflow.domain.rating.PremiumBreakdown
uses java.math.BigDecimal

/**
 * Sets the baseline premium for policy calculations.
 */
public class BasePremiumRule implements RatingRule {
  private static final var DEFAULT_BASE = policyflow.common.config.PolicyFlowConfig.BASE_PREMIUM_COMMERCIAL_AUTO
  private var _baseValue : BigDecimal

  /**
   * Default constructor initializing base premium to $500.00.
   */
  public construct() {
    _baseValue = DEFAULT_BASE
  }

  /**
   * Configurable constructor to specify custom base values.
   * 
   * @param baseValue Custom base premium.
   */
  public construct(baseValue : BigDecimal) {
    if (baseValue == null) {
      throw new IllegalArgumentException("Base value cannot be null")
    }
    _baseValue = baseValue
  }

  override function apply(vehicle : Vehicle, contact : Contact, breakdown : PremiumBreakdown) {
    breakdown.BasePremium = _baseValue
    breakdown.TotalPremium = breakdown.TotalPremium.add(_baseValue)
  }
}
