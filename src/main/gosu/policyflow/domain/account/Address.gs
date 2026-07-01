package policyflow.domain.account

public class Address {
  private var _addressLine1 : String as AddressLine1
  private var _addressLine2 : String as AddressLine2
  private var _city : String as City
  private var _state : String as State
  private var _postalCode : String as PostalCode
  private var _country : String as Country

  public construct() {}
  
  public construct(line1 : String, line2 : String, c : String, s : String, pc : String, co : String) {
    _addressLine1 = line1
    _addressLine2 = line2
    _city = c
    _state = s
    _postalCode = pc
    _country = co
  }
}
