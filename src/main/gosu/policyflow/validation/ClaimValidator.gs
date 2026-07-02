package policyflow.validation

uses policyflow.domain.claim.Claim
uses java.time.LocalDate

/**
 * Validator class for enforcing Claim invariants and validations.
 */
public class ClaimValidator {

  /**
   * Validates a Claim entity's state, returning errors or warnings.
   * 
   * @param claim The claim to validate.
   * @return A ValidationResult containing validation feedback.
   */
  public static function validate(claim : Claim) : ValidationResult {
    var result = new ValidationResult()

    if (claim == null) {
      result.addError("Claim cannot be null.")
      return result
    }

    // 1. Basic Invariants
    if (claim.ClaimNumber == null || claim.ClaimNumber.trim().isEmpty()) {
      result.addError("Claim Number is required.")
    }
    if (claim.PolicyId == null) {
      result.addError("Policy ID is required.")
    }
    if (claim.ClaimType == null) {
      result.addError("Claim Type is required.")
    }
    if (claim.Status == null) {
      result.addError("Claim Status is required.")
    }

    // 2. Date Validations
    var loss = claim.LossDate
    var reported = claim.ReportedDate
    var today = LocalDate.now()

    if (loss == null) {
      result.addError("Loss Date is required.")
    } else {
      if (loss.isAfter(today)) {
        result.addError("Loss Date (" + loss + ") cannot be in the future.")
      }
    }

    if (reported == null) {
      result.addError("Reported Date is required.")
    } else {
      if (reported.isAfter(today)) {
        result.addError("Reported Date (" + reported + ") cannot be in the future.")
      }
    }

    if (loss != null && reported != null) {
      if (reported.isBefore(loss)) {
        result.addError("Reported Date (" + reported + ") cannot be before Loss Date (" + loss + ").")
      }
    }

    // 3. Description
    if (claim.Description == null || claim.Description.trim().isEmpty()) {
      result.addError("Description is required.")
    }

    return result
  }
}
