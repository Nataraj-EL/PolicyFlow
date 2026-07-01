package policyflow.domain.policy

/**
 * Represents the lifecycle status of a Policy in PolicyFlow.
 */
public enum PolicyStatus {
  /**
   * Policy is being quoted or drafted, not yet active.
   */
  DRAFT,

  /**
   * Policy is active and in-force (risk is covered).
   */
  IN_FORCE,

  /**
   * Policy has been cancelled before its scheduled expiration.
   */
  CANCELLED,

  /**
   * Policy has reached its scheduled expiration date.
   */
  EXPIRED
}
