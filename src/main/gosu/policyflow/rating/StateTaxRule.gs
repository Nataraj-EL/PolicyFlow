package policyflow.rating

uses policyflow.domain.vehicle.Vehicle
uses policyflow.domain.account.Contact
uses policyflow.domain.rating.PremiumBreakdown
uses java.math.BigDecimal
uses java.math.RoundingMode

/**
 * Calculates state taxes based on accumulated premium subtotal.
 */
public class StateTaxRule implements RatingRule {
  private static final var DEFAULT_TAX_RATE = new BigDecimal("0.08") // 8%
  private var _taxRate : BigDecimal

  /**
   * Default constructor setting tax rate to 8%.
   */
  public construct() {
    _taxRate = DEFAULT_TAX_RATE
  }

  /**
   * Configurable constructor to specify custom tax rates.
   * 
   * @param taxRate Custom tax rate percentage.
   */
  public construct(taxRate : BigDecimal) {
    if (taxRate == null) {
      throw new IllegalArgumentException("Tax rate cannot be null")
    }
    _taxRate = taxRate
  }

  override function apply(vehicle : Vehicle, contact : Contact, breakdown : PremiumBreakdown) {
    var subtotal = breakdown.TotalPremium
    var taxAmount = subtotal.multiply(_taxRate).setScale(2, RoundingMode.HALF_UP)
    breakdown.Tax = taxAmount
    breakdown.TotalPremium = breakdown.TotalPremium.add(taxAmount)
  }
}
