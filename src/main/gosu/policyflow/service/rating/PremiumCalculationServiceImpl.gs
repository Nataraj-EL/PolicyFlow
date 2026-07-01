package policyflow.service.rating

uses policyflow.domain.vehicle.Vehicle
uses policyflow.domain.account.Contact
uses policyflow.domain.rating.PremiumBreakdown
uses policyflow.rating.PremiumCalculator

/**
 * Service implementation executing rating calculations.
 */
public class PremiumCalculationServiceImpl implements PremiumCalculationService {
  private var _calculator : PremiumCalculator

  /**
   * Default constructor initializing the standard premium calculator.
   */
  public construct() {
    _calculator = new PremiumCalculator()
  }

  /**
   * Configurable constructor injecting a custom premium calculator.
   * 
   * @param calculator The custom premium calculator to use.
   */
  public construct(calculator : PremiumCalculator) {
    if (calculator == null) {
      throw new IllegalArgumentException("PremiumCalculator cannot be null")
    }
    _calculator = calculator
  }

  override function calculatePremium(vehicle : Vehicle, contact : Contact) : PremiumBreakdown {
    if (vehicle == null) {
      throw new IllegalArgumentException("Vehicle cannot be null")
    }
    if (contact == null) {
      throw new IllegalArgumentException("Contact cannot be null")
    }
    return _calculator.calculate(vehicle, contact)
  }
}
