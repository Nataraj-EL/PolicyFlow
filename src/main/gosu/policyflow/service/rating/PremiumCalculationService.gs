package policyflow.service.rating

uses policyflow.domain.vehicle.Vehicle
uses policyflow.domain.account.Contact
uses policyflow.domain.rating.PremiumBreakdown

/**
 * Service interface for running premium calculation runs against vehicles and contacts.
 */
public interface PremiumCalculationService {
  /**
   * Calculates a complete premium breakdown based on vehicle and contact attributes.
   * 
   * @param vehicle The vehicle entity.
   * @param contact The contact entity.
   * @return A detailed PremiumBreakdown.
   * @throws IllegalArgumentException if inputs are null.
   */
  public function calculatePremium(vehicle : Vehicle, contact : Contact) : PremiumBreakdown
}
