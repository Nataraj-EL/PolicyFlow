package policyflow.common.util

/**
 * Utility for minimal text and input sanitization (trimming, spacing normalizations, email lowercasing).
 */
public class SanitizationUtil {

  /**
   * Trims whitespace and normalizes multiple inner whitespace characters into a single space.
   * Does not strip characters.
   * 
   * @param val The string to sanitize.
   * @return Sanitized string, or null if input is null.
   */
  public static function sanitizeText(val : String) : String {
    if (val == null) {
      return null
    }
    return val.trim().replaceAll("\\s+", " ")
  }

  /**
   * Trims whitespace and converts an email address string to lowercase.
   * 
   * @param val The email address string.
   * @return Lowercased and trimmed email address, or null if input is null.
   */
  public static function sanitizeEmail(val : String) : String {
    if (val == null) {
      return null
    }
    return val.trim().toLowerCase()
  }
}
