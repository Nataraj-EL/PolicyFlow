package policyflow.validation

uses policyflow.domain.account.Contact
uses policyflow.domain.account.ContactType
uses policyflow.domain.account.Address

/**
 * Validator class for enforcing customer Contact domain invariants.
 */
public class ContactValidator {

  /**
   * Validates a Contact entity's state, returning errors or warnings.
   * 
   * @param contact The contact to validate.
   * @return A ValidationResult containing validation feedback.
   */
  public static function validate(contact : Contact) : ValidationResult {
    var result = new ValidationResult()

    if (contact == null) {
      result.addError("Contact cannot be null.")
      return result
    }

    if (contact.ContactType == null) {
      result.addError("Contact type is required.")
      return result
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

    // Email format validation (simple check)
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

    return result
  }

  /**
   * Helper function to validate completeness of an Address value object.
   * 
   * @param address The address value object to check.
   * @param context Context string for error messaging.
   * @param result Staging validation results collector.
   */
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
