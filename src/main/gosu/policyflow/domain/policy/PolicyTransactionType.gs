package policyflow.domain.policy

/**
 * Represents the type of policy transaction or job that modified a Policy.
 */
public enum PolicyTransactionType {
  /**
   * Initial submission/creation.
   */
  CREATION,

  /**
   * Mid-term policy endorsement/change.
   */
  ENDORSEMENT,

  /**
   * Term renewal.
   */
  RENEWAL,

  /**
   * Policy cancellation.
   */
  CANCELLATION,

  /**
   * Reinstating a cancelled policy.
   */
  REINSTATEMENT,

  /**
   * Policy term expiration.
   */
  EXPIRATION
}
