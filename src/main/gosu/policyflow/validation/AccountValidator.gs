package policyflow.validation

uses policyflow.domain.account.Account
uses policyflow.domain.account.Contact
uses policyflow.domain.account.ContactType
uses policyflow.domain.account.Address

public class AccountValidator {
  
  public static function validate(account : Account) : ValidationResult {
    var result = new ValidationResult()
    
    if (account == null) {
      result.addError("Account cannot be null.")
      return result
    }

    // 1. Account Number Validation
    var accNum = account.AccountNumber
    if (accNum == null || accNum.trim().isEmpty()) {
      result.addError("Account number is required.")
    } else if (accNum.length() < 3) {
      result.addError("Account number must be at least 3 characters long.")
    }

    // 2. Billing Address Validation
    if (account.BillingAddress == null) {
      result.addError("Account billing address is required.")
    } else {
      validateAddress(account.BillingAddress, "Account Billing Address", result)
    }

    // 3. Contacts Validation
    if (account.Contacts == null || account.Contacts.isEmpty()) {
      result.addError("Account must have at least one contact.")
    } else {
      for (contact in account.Contacts) {
        validateContact(contact, result)
      }
    }

    // 4. Primary Contact Validation
    var primary = account.PrimaryContact
    if (primary == null) {
      result.addError("Account must have a primary contact.")
    } else if (!account.Contacts.contains(primary)) {
      result.addError("Primary contact must be one of the account contacts.")
    }

    return result
  }

  private static function validateContact(contact : Contact, result : ValidationResult) {
    if (contact.ContactType == null) {
      result.addError("Contact type is required.")
      return
    }

    if (contact.ContactType == ContactType.PERSON) {
      if (contact.FirstName == null || contact.FirstName.trim().isEmpty()) {
        result.addError("First name is required for contact: " + contact.DisplayName)
      }
      if (contact.LastName == null || contact.LastName.trim().isEmpty()) {
        result.addError("Last name is required for contact: " + contact.DisplayName)
      }
    } else if (contact.ContactType == ContactType.COMPANY) {
      if (contact.CompanyName == null || contact.CompanyName.trim().isEmpty()) {
        result.addError("Company name is required.")
      }
    }

    // Email format validation (simple regex check)
    var email = contact.EmailAddress
    if (email != null && !email.trim().isEmpty()) {
      if (!email.contains("@") || !email.contains(".")) {
        result.addError("Invalid email address format: " + email + " for contact " + contact.DisplayName)
      }
    }

    // Primary address for contact
    if (contact.PrimaryAddress == null) {
      result.addError("Primary address is required for contact: " + contact.DisplayName)
    } else {
      validateAddress(contact.PrimaryAddress, "Primary Address of contact " + contact.DisplayName, result)
    }
  }

  private static function validateAddress(address : Address, context : String, result : ValidationResult) {
    if (address.AddressLine1 == null || address.AddressLine1.trim().isEmpty()) {
      result.addError(context + ": Address Line 1 is required.")
    }
    if (address.City == null || address.City.trim().isEmpty()) {
      result.addError(context + ": City is required.")
    }
    if (address.State == null || address.State.trim().isEmpty()) {
      result.addError(context + ": State is required.")
    }
    if (address.PostalCode == null || address.PostalCode.trim().isEmpty()) {
      result.addError(context + ": Postal Code is required.")
    }
    if (address.Country == null || address.Country.trim().isEmpty()) {
      result.addError(context + ": Country is required.")
    }
  }
}
