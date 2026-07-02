package policyflow.domain.claim

/**
 * Represents the type of transaction or update job on a Claim.
 */
public enum ClaimTransactionType {
  /**
   * Claim created/filed initially.
   */
  CREATION,

  /**
   * Claim details updated.
   */
  UPDATE,

  /**
   * Claim closed.
   */
  CLOSE
}
