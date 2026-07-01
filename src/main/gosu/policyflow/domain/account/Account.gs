package policyflow.domain.account

uses java.util.ArrayList
uses java.util.List

public class Account {
  private var _accountNumber : String as AccountNumber
  private var _status : AccountStatus as Status = AccountStatus.DRAFT
  private var _primaryContact : Contact
  private var _contacts : List<Contact> as Contacts = new ArrayList<Contact>()
  private var _billingAddress : Address as BillingAddress

  public construct() {}

  public construct(accountNumber : String) {
    _accountNumber = accountNumber
  }

  public property get PrimaryContact() : Contact {
    return _primaryContact
  }

  public property set PrimaryContact(contact : Contact) {
    _primaryContact = contact
    if (contact != null && !_contacts.contains(contact)) {
      _contacts.add(contact)
    }
  }

  public function addContact(contact : Contact) {
    if (contact != null && !_contacts.contains(contact)) {
      _contacts.add(contact)
    }
  }

  public function removeContact(contact : Contact) : boolean {
    if (contact == _primaryContact) {
      throw new IllegalStateException("Cannot remove primary contact from account")
    }
    return _contacts.remove(contact)
  }
}
