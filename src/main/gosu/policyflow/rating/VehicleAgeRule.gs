package policyflow.rating

uses policyflow.domain.vehicle.Vehicle
uses policyflow.domain.account.Contact
uses policyflow.domain.rating.PremiumBreakdown
uses java.math.BigDecimal
uses java.time.LocalDate

/**
 * Adjusts premium based on vehicle age (calculated against reference or current year).
 */
public class VehicleAgeRule implements RatingRule {
  private var _referenceYear : int
  private var _newCarThreshold : int = 3
  private var _oldCarThreshold : int = 10
  private var _newCarFactor : BigDecimal = new BigDecimal("100.00")
  private var _oldCarFactor : BigDecimal = new BigDecimal("50.00")

  /**
   * Default constructor setting thresholds and reference year dynamically to current time.
   */
  public construct() {
    _referenceYear = LocalDate.now().getYear()
  }

  /**
   * Configurable constructor to specify calculation parameters.
   * 
   * @param referenceYear Year to compute vehicle age against.
   * @param newCarThresh Max age to qualify as a new vehicle.
   * @param oldCarThresh Min age to qualify as an old vehicle.
   * @param newCarFac Price adjustment for new vehicles.
   * @param oldCarFac Price adjustment for old vehicles.
   */
  public construct(referenceYear : int, newCarThresh : int, oldCarThresh : int, newCarFac : BigDecimal, oldCarFac : BigDecimal) {
    _referenceYear = referenceYear
    _newCarThreshold = newCarThresh
    _oldCarThreshold = oldCarThresh
    _newCarFactor = newCarFac
    _oldCarFactor = oldCarFac
  }

  override function apply(vehicle : Vehicle, contact : Contact, breakdown : PremiumBreakdown) {
    if (vehicle != null && vehicle.ManufactureYear > 0) {
      var age = _referenceYear - vehicle.ManufactureYear
      var factor = BigDecimal.ZERO
      if (age < _newCarThreshold) {
        factor = _newCarFactor
      } else if (age >= _oldCarThreshold) {
        factor = _oldCarFactor
      }
      breakdown.VehicleAgeAdjustment = factor
      breakdown.TotalPremium = breakdown.TotalPremium.add(factor)
    }
  }
}
