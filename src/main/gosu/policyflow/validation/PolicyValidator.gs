package policyflow.validation

uses policyflow.domain.policy.Policy
uses policyflow.domain.policy.PolicyStatus

/**
 * Validator class for enforcing Policy contract invariants and lifecycle rules.
 */
public class PolicyValidator {

  /**
   * Validates a Policy entity's state, returning errors or warnings.
   * 
   * @param policy The policy to validate.
   * @return A ValidationResult containing validation feedback.
   */
  public static function validate(policy : Policy) : ValidationResult {
    var result = new ValidationResult()

    if (policy == null) {
      result.addError("Policy cannot be null.")
      return result
    }

    // 1. Basic Invariants
    if (policy.PolicyNumber == null || policy.PolicyNumber.trim().isEmpty()) {
      result.addError("Policy Number is required.")
    }
    if (policy.PolicyType == null) {
      result.addError("Policy Type is required.")
    }
    if (policy.Status == null) {
      result.addError("Policy Status is required.")
    }

    // 2. Linkages
    if (policy.PrimaryNamedInsuredId == null) {
      result.addError("Primary Named Insured ID is required.")
    }
    if (policy.VehicleId == null) {
      result.addError("Vehicle ID is required.")
    }

    // 3. Date Validations
    var eff = policy.EffectiveDate
    var exp = policy.ExpirationDate
    if (eff == null) {
      result.addError("Effective Date is required.")
    }
    if (exp == null) {
      result.addError("Expiration Date is required.")
    }
    if (eff != null && exp != null) {
      if (!exp.isAfter(eff)) {
        result.addError("Expiration Date (" + exp + ") must be after Effective Date (" + eff + ").")
      }
    }

    // 4. Cancellation Rules (Enforced only for CANCELLED policies)
    if (policy.Status == PolicyStatus.CANCELLED) {
      var cancelDate = policy.CancellationDate
      var cancelReason = policy.CancellationReason

      if (cancelDate == null) {
        result.addError("Cancellation Date is required for cancelled policies.")
      } else if (eff != null && cancelDate.isBefore(eff)) {
        result.addError("Cancellation Date (" + cancelDate + ") cannot be before Effective Date (" + eff + ").")
      }

      if (cancelReason == null || cancelReason.trim().isEmpty()) {
        result.addError("Cancellation Reason is required for cancelled policies.")
      }
    }

    return result
  }
}
