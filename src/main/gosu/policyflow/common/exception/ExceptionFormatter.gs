package policyflow.common.exception

uses policyflow.validation.ValidationException

/**
 * Utility class to format exceptions into standardized structured message blocks.
 */
public class ExceptionFormatter {

  /**
   * Formats a Throwable into a clean error block detailing the exception classification.
   * 
   * @param t The throwable to format.
   * @return A formatted error details string.
   */
  public static function format(t : Throwable) : String {
    if (t == null) {
      return "No error details available (Exception is null)."
    }

    var sb = new java.lang.StringBuilder()
    sb.append("[").append(t.Class.SimpleName).append("] ")

    if (t typeis ValidationException) {
      sb.append("Validation failed with ").append(t.Errors.size()).append(" error(s):")
      for (err in t.Errors) {
        sb.append("\n  - ").append(err)
      }
    } else {
      sb.append(t.Message ?: "An unexpected error occurred.")
    }

    return sb.toString()
  }
}
