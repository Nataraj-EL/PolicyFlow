package policyflow.domain.claim

/**
 * Represents the category or cause of loss for a Claim.
 */
public enum ClaimType {
  /**
   * Vehicle-on-vehicle collision or single-car crash.
   */
  COLLISION,

  /**
   * Non-collision events (e.g., animal strike, glass damage).
   */
  COMPREHENSIVE,

  /**
   * Third-party bodily injury or property damage.
   */
  LIABILITY,

  /**
   * Stolen vehicle or parts.
   */
  THEFT,

  /**
   * Weather events (e.g. hail, flood, wind).
   */
  WEATHER,

  /**
   * Miscellaneous or unclassified cause.
   */
  OTHER
}
