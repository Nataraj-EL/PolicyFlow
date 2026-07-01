package policyflow.rating

uses policyflow.domain.vehicle.Vehicle
uses policyflow.domain.account.Contact
uses policyflow.domain.rating.PremiumBreakdown

/**
 * Strategy interface representing a single rating or pricing rule in PolicyFlow.
 */
public interface RatingRule {
  /**
   * Applies the rating logic to the given vehicle and contact, updating the premium breakdown.
   * 
   * @param vehicle The vehicle entity.
   * @param contact The contact entity.
   * @param breakdown The premium breakdown being accumulated.
   */
  public function apply(vehicle : Vehicle, contact : Contact, breakdown : PremiumBreakdown) : void
}
