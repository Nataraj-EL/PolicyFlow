package policyflow.domain.account

uses java.util.UUID

/**
 * Represents a Customer or Contact entity in PolicyFlow.
 * Each Contact is uniquely identified by an immutable {@link java.util.UUID} ID.
 * Supports both Person and Company type classifications.
 */
public class Contact {
  private var _id : UUID as readonly ID
  private var _firstName : String as FirstName
  private var _lastName : String as LastName
  private var _companyName : String as CompanyName
  private var _emailAddress : String as EmailAddress
  private var _phoneNumber : String as PhoneNumber
  private var _contactType : ContactType as ContactType
  private var _primaryAddress : Address as PrimaryAddress

  /**
   * Constructs a Contact with an auto-generated unique identifier.
   */
  public construct() {
    _id = UUID.randomUUID()
  }

  /**
   * Constructs a Contact of a specified type with an auto-generated unique identifier.
   * 
   * @param type The type of contact (PERSON or COMPANY).
   */
  public construct(type : ContactType) {
    _id = UUID.randomUUID()
    _contactType = type
  }

  /**
   * Property providing the presentation displayName of the contact.
   * Concatenates firstName and lastName for PERSON, or returns companyName for COMPANY.
   */
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
