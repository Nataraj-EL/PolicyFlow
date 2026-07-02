package policyflow.common.exception

/**
 * Exception thrown when business rules, lifecycles, or logical conditions fail.
 */
public class BusinessRuleException extends PolicyFlowException {
  /**
   * Constructs an exception with message.
   * 
   * @param message The detail message.
   */
  public construct(message : String) {
    super(message)
  }
}
