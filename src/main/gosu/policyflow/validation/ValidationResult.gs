package policyflow.validation

uses java.util.ArrayList
uses java.util.List

/**
 * Holder class containing validation error and warning feedback from validators.
 */
public class ValidationResult {
  private var _errors : List<String> as readonly Errors = new ArrayList<String>()
  private var _warnings : List<String> as readonly Warnings = new ArrayList<String>()

  /**
   * Constructs an empty ValidationResult.
   */
  public construct() {}

  /**
   * Adds an error message to this validation result.
   * 
   * @param msg The error message to add.
   */
  public function addError(msg : String) {
    if (msg != null && !msg.trim().isEmpty()) {
      _errors.add(msg)
    }
  }

  /**
   * Adds a warning message to this validation result.
   * 
   * @param msg The warning message to add.
   */
  public function addWarning(msg : String) {
    if (msg != null && !msg.trim().isEmpty()) {
      _warnings.add(msg)
    }
  }

  /**
   * Returns true if errors exist, false otherwise.
   */
  public property get HasErrors() : boolean {
    return !_errors.isEmpty()
  }

  /**
   * Returns true if warnings exist, false otherwise.
   */
  public property get HasWarnings() : boolean {
    return !_warnings.isEmpty()
  }

  /**
   * Returns true if validation was successful (no errors), false otherwise.
   */
  public property get Success() : boolean {
    return _errors.isEmpty()
  }
}
