package policyflow.domain.account

/**
 * Address represents a physical or mailing location in PolicyFlow.
 * This class acts as a Value Object and does not hold its own identity (no ID).
 */
public class Address {
  private var _addressLine1 : String as AddressLine1
  private var _addressLine2 : String as AddressLine2
  private var _city : String as City
  private var _state : String as State
  private var _postalCode : String as PostalCode
  private var _country : String as Country

  /**
   * Default constructor creating an empty Address value object.
   */
  public construct() {}
  
  /**
   * Constructs an Address value object with fully qualified fields.
   * 
   * @param line1 Street address first line.
   * @param line2 Street address second line (optional).
   * @param c City location.
   * @param s State or region.
   * @param pc Postal/ZIP Code.
   * @param co Country name.
   */
  public construct(line1 : String, line2 : String, c : String, s : String, pc : String, co : String) {
    _addressLine1 = line1
    _addressLine2 = line2
    _city = c
    _state = s
    _postalCode = pc
    _country = co
  }
}
