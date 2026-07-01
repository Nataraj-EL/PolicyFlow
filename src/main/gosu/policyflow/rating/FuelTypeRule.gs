package policyflow.rating

uses policyflow.domain.vehicle.Vehicle
uses policyflow.domain.vehicle.FuelType
uses policyflow.domain.account.Contact
uses policyflow.domain.rating.PremiumBreakdown
uses java.math.BigDecimal
uses java.util.HashMap
uses java.util.Map

/**
 * Enforces green vehicle discounts based on fuel type.
 */
public class FuelTypeRule implements RatingRule {
  private var _discounts : Map<FuelType, BigDecimal> = new HashMap<FuelType, BigDecimal>()

  /**
   * Default constructor initializing green pricing adjustments.
   */
  public construct() {
    _discounts.put(FuelType.GASOLINE, new BigDecimal("0.00"))
    _discounts.put(FuelType.DIESEL, new BigDecimal("0.00"))
    _discounts.put(FuelType.ELECTRIC, new BigDecimal("-50.00"))
    _discounts.put(FuelType.HYBRID, new BigDecimal("-25.00"))
  }

  /**
   * Configurable constructor allowing custom pricing maps.
   * 
   * @param customDiscounts Map of customized fuel discounts.
   */
  public construct(customDiscounts : Map<FuelType, BigDecimal>) {
    if (customDiscounts == null) {
      throw new IllegalArgumentException("Discounts map cannot be null")
    }
    _discounts.putAll(customDiscounts)
  }

  override function apply(vehicle : Vehicle, contact : Contact, breakdown : PremiumBreakdown) {
    if (vehicle != null && vehicle.FuelType != null) {
      var discount = _discounts.get(vehicle.FuelType) ?: BigDecimal.ZERO
      breakdown.FuelTypeAdjustment = discount
      breakdown.TotalPremium = breakdown.TotalPremium.add(discount)
    }
  }
}
