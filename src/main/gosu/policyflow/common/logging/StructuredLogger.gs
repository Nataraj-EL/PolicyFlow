package policyflow.common.logging

uses java.time.LocalDateTime
uses java.util.Map
uses java.util.logging.Level
uses java.util.logging.Logger

/**
 * Custom contextual logger that outputs structured logs (simulating JSON format).
 */
public class StructuredLogger {
  private var _logger : Logger

  private construct(name : String) {
    _logger = Logger.getLogger(name)
  }

  /**
   * Factory method to obtain a logger instance.
   * 
   * @param clazz The class requesting the logger.
   * @return The StructuredLogger.
   */
  public static function getLogger(clazz : Class) : StructuredLogger {
    return new StructuredLogger(clazz != null ? clazz.Name : "PolicyFlow")
  }

  /**
   * Logs an info level message.
   * 
   * @param msg The message.
   */
  public function info(msg : String) {
    info(msg, null)
  }

  /**
   * Logs an info level message with contextual metadata.
   * 
   * @param msg The message.
   * @param context Key-value parameters.
   */
  public function info(msg : String, context : Map<String, Object>) {
    log(Level.INFO, msg, context)
  }

  /**
   * Logs a warning level message.
   * 
   * @param msg The message.
   */
  public function warn(msg : String) {
    warn(msg, null)
  }

  /**
   * Logs a warning level message with contextual metadata.
   * 
   * @param msg The message.
   * @param context Key-value parameters.
   */
  public function warn(msg : String, context : Map<String, Object>) {
    log(Level.WARNING, msg, context)
  }

  /**
   * Logs an error level message.
   * 
   * @param msg The message.
   */
  public function error(msg : String) {
    error(msg, null)
  }

  /**
   * Logs an error level message with contextual metadata.
   * 
   * @param msg The message.
   * @param context Key-value parameters.
   */
  public function error(msg : String, context : Map<String, Object>) {
    log(Level.SEVERE, msg, context)
  }

  /**
   * Logs a debug level message.
   * 
   * @param msg The message.
   */
  public function debug(msg : String) {
    debug(msg, null)
  }

  /**
   * Logs a debug level message with contextual metadata.
   * 
   * @param msg The message.
   * @param context Key-value parameters.
   */
  public function debug(msg : String, context : Map<String, Object>) {
    log(Level.FINE, msg, context)
  }

  private function log(lvl : Level, msg : String, context : Map<String, Object>) {
    var timestamp = LocalDateTime.now().toString()
    var threadName = Thread.currentThread().Name
    var loggerName = _logger.Name

    var sb = new java.lang.StringBuilder()
    sb.append("{")
      .append("\"timestamp\":\"").append(timestamp).append("\",")
      .append("\"level\":\"").append(lvl.Name).append("\",")
      .append("\"logger\":\"").append(loggerName).append("\",")
      .append("\"thread\":\"").append(threadName).append("\",")
      .append("\"message\":\"").append(msg).append("\"")

    if (context != null && !context.isEmpty()) {
      sb.append(",\"context\":{")
      var first = true
      for (entry in context.entrySet()) {
        if (!first) sb.append(",")
        sb.append("\"").append(entry.Key).append("\":\"").append(entry.Value).append("\"")
        first = false
      }
      sb.append("}")
    }
    sb.append("}")

    _logger.log(lvl, sb.toString())
  }
}
