package policyflow.validation

uses policyflow.domain.account.Account
uses policyflow.domain.account.Address

/**
 * Validator class for enforcing customer Account domain invariants.
 */
public class AccountValidator {
  
  /**
   * Validates an Account entity's state, returning errors or warnings.
   * Delegates contact-level validations to {@link ContactValidator}.
   * 
   * @param account The account to validate.
   * @return A ValidationResult containing validation feedback.
   */
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
        var contactResult = ContactValidator.validate(contact)
        for (err in contactResult.Errors) {
          result.addError(err)
        }
        for (warn in contactResult.Warnings) {
          result.addWarning(warn)
        }
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
