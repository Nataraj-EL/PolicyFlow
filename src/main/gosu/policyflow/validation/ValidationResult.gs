package policyflow.validation

uses java.util.ArrayList
uses java.util.List

public class ValidationResult {
  private var _errors : List<String> as readonly Errors = new ArrayList<String>()
  private var _warnings : List<String> as readonly Warnings = new ArrayList<String>()

  public construct() {}

  public function addError(msg : String) {
    if (msg != null && !msg.trim().isEmpty()) {
      _errors.add(msg)
    }
  }

  public function addWarning(msg : String) {
    if (msg != null && !msg.trim().isEmpty()) {
      _warnings.add(msg)
    }
  }

  public property get HasErrors() : boolean {
    return !_errors.isEmpty()
  }

  public property get HasWarnings() : boolean {
    return !_warnings.isEmpty()
  }

  public property get Success() : boolean {
    return _errors.isEmpty()
  }
}
