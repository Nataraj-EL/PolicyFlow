package policyflow.domain.account

uses java.util.ArrayList
uses java.util.List

/**
 * Represents a customer Account in PolicyFlow.
 * Accounts organize billing details, status lifecycles, and associated contacts.
 */
public class Account {
  private var _accountNumber : String as AccountNumber
  private var _status : AccountStatus as Status = AccountStatus.DRAFT
  private var _primaryContact : Contact
  private var _contacts : List<Contact> as Contacts = new ArrayList<Contact>()
  private var _billingAddress : Address as BillingAddress

  /**
   * Default constructor for Account.
   */
  public construct() {}

  /**
   * Constructs an Account with a specified account number.
   * 
   * @param accountNumber Unique account number.
   */
  public construct(accountNumber : String) {
    _accountNumber = accountNumber
  }

  /**
   * Property for the Primary Contact of this account.
   * Assigning a primary contact automatically associates the contact with the account contacts list.
   */
  public property get PrimaryContact() : Contact {
    return _primaryContact
  }

  public property set PrimaryContact(contact : Contact) {
    _primaryContact = contact
    if (contact != null && !_contacts.contains(contact)) {
      _contacts.add(contact)
    }
  }

  /**
   * Associates a contact with this account.
   * 
   * @param contact The contact to add.
   */
  public function addContact(contact : Contact) {
    if (contact != null && !_contacts.contains(contact)) {
      _contacts.add(contact)
    }
  }

  /**
   * Removes a contact association from this account.
   * Cannot remove the primary contact.
   * 
   * @param contact The contact to remove.
   * @return true if the contact was removed, false otherwise.
   * @throws IllegalStateException if the contact is the primary contact.
   */
  public function removeContact(contact : Contact) : boolean {
    if (contact == _primaryContact) {
      throw new IllegalStateException("Cannot remove primary contact from account")
    }
    return _contacts.remove(contact)
  }
}
