package policyflow.domain.account

public class Contact {
  private var _firstName : String as FirstName
  private var _lastName : String as LastName
  private var _companyName : String as CompanyName
  private var _emailAddress : String as EmailAddress
  private var _phoneNumber : String as PhoneNumber
  private var _contactType : ContactType as ContactType
  private var _primaryAddress : Address as PrimaryAddress

  public construct() {}

  public construct(type : ContactType) {
    _contactType = type
  }

  public property get DisplayName() : String {
    if (_contactType == policyflow.domain.account.ContactType.PERSON) {
      var first = _firstName ?: ""
      var last = _lastName ?: ""
      return (first + " " + last).trim()
    } else {
      return _companyName ?: ""
    }
  }
}
