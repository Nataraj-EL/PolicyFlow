package policyflow.rating

uses policyflow.domain.vehicle.Vehicle
uses policyflow.domain.account.Contact
uses policyflow.domain.rating.PremiumBreakdown
uses java.util.ArrayList
uses java.util.List

/**
 * Coordinator class managing and executing a chain of {@link RatingRule} strategies.
 */
public class PremiumCalculator {
  private var _rules : List<RatingRule> = new ArrayList<RatingRule>()

  /**
   * Default constructor setting up the standard Guidewire-style calculation chain.
   */
  public construct() {
    _rules.add(new BasePremiumRule())
    _rules.add(new VehicleTypeRule())
    _rules.add(new VehicleAgeRule())
    _rules.add(new FuelTypeRule())
    _rules.add(new ContactTypeRule())
    _rules.add(new StateTaxRule())
  }

  /**
   * Configurable constructor to specify customized pricing rules or order.
   * 
   * @param rules Custom list of rating rule strategies.
   */
  public construct(rules : List<RatingRule>) {
    if (rules == null) {
      throw new IllegalArgumentException("Rules list cannot be null")
    }
    _rules.addAll(rules)
  }

  /**
   * Calculates a complete premium breakdown by running all configured rating rules in sequence.
   * 
   * @param vehicle The vehicle entity.
   * @param contact The contact entity.
   * @return A detailed PremiumBreakdown.
   */
  public function calculate(vehicle : Vehicle, contact : Contact) : PremiumBreakdown {
    var breakdown = new PremiumBreakdown()
    for (rule in _rules) {
      rule.apply(vehicle, contact, breakdown)
    }
    return breakdown
  }
}
