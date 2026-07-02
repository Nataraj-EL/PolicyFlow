package policyflow.domain.claim

/**
 * Represents the lifecycle status of a Claim in PolicyFlow.
 */
public enum ClaimStatus {
  /**
   * Draft status before filing.
   */
  DRAFT,

  /**
   * Filed and open for investigation.
   */
  OPEN,

  /**
   * Claim closed after resolution/payout/refusal.
   */
  CLOSED,

  /**
   * Claim rejected by claims adjuster/underwriter.
   */
  REJECTED
}
