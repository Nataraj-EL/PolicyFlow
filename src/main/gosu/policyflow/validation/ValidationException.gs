package policyflow.validation

uses java.lang.RuntimeException
uses java.util.List

public class ValidationException extends RuntimeException {
  private var _errors : List<String> as readonly Errors

  public construct(errors : List<String>) {
    super("Validation failed with " + errors.size() + " errors: " + String.join(", ", errors))
    _errors = errors
  }
}
