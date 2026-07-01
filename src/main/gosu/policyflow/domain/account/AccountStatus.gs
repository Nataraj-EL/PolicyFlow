package policyflow.domain.account

/**
 * Represents the lifecycle status of a customer Account in PolicyFlow.
 * 
 * Lifecycles:
 * - {@link #DRAFT}: The initial state of an account. Field values can be edited freely.
 * - {@link #ACTIVE}: The active state after passing validation checks. Ready for transaction processing.
 * - {@link #SUSPENDED}: Suspended due to underwriting or billing reasons.
 * - {@link #CLOSED}: Terminal closed state. Closed accounts cannot be re-activated.
 */
public enum AccountStatus {
  /**
   * Account is created but not yet active or validated.
   */
  DRAFT,

  /**
   * Account is fully active and validated.
   */
  ACTIVE,

  /**
   * Account is suspended.
   */
  SUSPENDED,

  /**
   * Account is closed (terminal state).
   */
  CLOSED
}
