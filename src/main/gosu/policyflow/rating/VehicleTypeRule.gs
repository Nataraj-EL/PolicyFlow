package policyflow.rating

uses policyflow.domain.vehicle.Vehicle
uses policyflow.domain.vehicle.VehicleType
uses policyflow.domain.account.Contact
uses policyflow.domain.rating.PremiumBreakdown
uses java.math.BigDecimal
uses java.util.HashMap
uses java.util.Map

/**
 * Adjusts premium based on vehicle body styles.
 */
public class VehicleTypeRule implements RatingRule {
  private var _factors : Map<VehicleType, BigDecimal> = new HashMap<VehicleType, BigDecimal>()

  /**
   * Default constructor initializing standard risk factors.
   */
  public construct() {
    _factors.put(VehicleType.SEDAN, new BigDecimal("0.00"))
    _factors.put(VehicleType.SUV, new BigDecimal("2000.00"))
    _factors.put(VehicleType.TRUCK, new BigDecimal("3000.00"))
    _factors.put(VehicleType.COUPE, new BigDecimal("4000.00"))
    _factors.put(VehicleType.VAN, new BigDecimal("2400.00"))
    _factors.put(VehicleType.MOTORCYCLE, new BigDecimal("-1000.00"))
  }

  /**
   * Configurable constructor allowing custom risk mappings.
   * 
   * @param customFactors Map of customized vehicle factors.
   */
  public construct(customFactors : Map<VehicleType, BigDecimal>) {
    if (customFactors == null) {
      throw new IllegalArgumentException("Factors map cannot be null")
    }
    _factors.putAll(customFactors)
  }

  override function apply(vehicle : Vehicle, contact : Contact, breakdown : PremiumBreakdown) {
    if (vehicle != null && vehicle.VehicleType != null) {
      var factor = _factors.get(vehicle.VehicleType) ?: BigDecimal.ZERO
      breakdown.VehicleTypeAdjustment = factor
      breakdown.TotalPremium = breakdown.TotalPremium.add(factor)
    }
  }
}
