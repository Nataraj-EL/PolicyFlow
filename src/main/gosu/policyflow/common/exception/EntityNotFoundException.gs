package policyflow.common.exception

/**
 * Exception thrown when lookups for entities (e.g. Contacts, Vehicles, Policies, Claims) fail.
 */
public class EntityNotFoundException extends PolicyFlowException {
  /**
   * Constructs an exception with message.
   * 
   * @param message The detail message.
   */
  public construct(message : String) {
    super(message)
  }
}
