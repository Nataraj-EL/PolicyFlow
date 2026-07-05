package policyflow.rating

uses policyflow.domain.vehicle.Vehicle
uses policyflow.domain.account.Contact
uses policyflow.domain.account.ContactType
uses policyflow.domain.rating.PremiumBreakdown
uses java.math.BigDecimal
uses java.util.HashMap
uses java.util.Map

/**
 * Adjusts premium based on contact classification (Person vs Company commercial risk).
 */
public class ContactTypeRule implements RatingRule {
  private var _factors : Map<ContactType, BigDecimal> = new HashMap<ContactType, BigDecimal>()

  /**
   * Default constructor setting standard Contact type risk factors.
   */
  public construct() {
    _factors.put(ContactType.PERSON, new BigDecimal("0.00"))
    _factors.put(ContactType.COMPANY, new BigDecimal("2000.00"))
  }

  /**
   * Configurable constructor allowing custom Contact factors.
   * 
   * @param customFactors Map of customized contact factors.
   */
  public construct(customFactors : Map<ContactType, BigDecimal>) {
    if (customFactors == null) {
      throw new IllegalArgumentException("Factors map cannot be null")
    }
    _factors.putAll(customFactors)
  }

  override function apply(vehicle : Vehicle, contact : Contact, breakdown : PremiumBreakdown) {
    if (contact != null && contact.ContactType != null) {
      var factor = _factors.get(contact.ContactType) ?: BigDecimal.ZERO
      breakdown.ContactTypeAdjustment = factor
      breakdown.TotalPremium = breakdown.TotalPremium.add(factor)
    }
  }
}
