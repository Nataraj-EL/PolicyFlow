package policyflow.validation

uses policyflow.common.exception.PolicyFlowException
uses java.util.List

/**
 * Custom runtime exception thrown when domain validation rules are violated.
 * Carries structured error messages.
 */
public class ValidationException extends PolicyFlowException {
  private var _errors : List<String> as readonly Errors

  /**
   * Constructs a ValidationException with a list of validation errors.
   * 
   * @param errors List of error strings.
   */
  public construct(errors : List<String>) {
    super("Validation failed with " + errors.size() + " errors: " + String.join(", ", errors))
    _errors = errors
  }
}
