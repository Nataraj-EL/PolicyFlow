package policyflow.common.exception

uses java.lang.RuntimeException

/**
 * Base checked runtime exception class for PolicyFlow.
 */
public class PolicyFlowException extends RuntimeException {
  /**
   * Constructs an exception with message.
   * 
   * @param message The detail message.
   */
  public construct(message : String) {
    super(message)
  }

  /**
   * Constructs an exception with message and cause.
   * 
   * @param message The detail message.
   * @param cause The cause.
   */
  public construct(message : String, cause : Throwable) {
    super(message, cause)
  }
}
