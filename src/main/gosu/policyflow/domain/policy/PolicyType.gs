package policyflow.domain.policy

/**
 * Represents the type or line of business for a Policy in PolicyFlow.
 */
public enum PolicyType {
  /**
   * Personal auto insurance line.
   */
  PERSONAL_AUTO,

  /**
   * Commercial auto insurance line.
   */
  COMMERCIAL_AUTO,

  /**
   * Property or home owners line.
   */
  PROPERTY,

  /**
   * Commercial or personal liability line.
   */
  LIABILITY
}
