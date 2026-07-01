package policyflow.domain.policy

uses java.time.LocalDateTime
uses java.util.UUID

/**
 * Audit history entry documenting a state transition or policy transaction.
 */
public class PolicyHistoryEntry {
  private var _id : UUID as readonly ID
  private var _policyId : UUID as PolicyId
  private var _transactionType : PolicyTransactionType as TransactionType
  private var _oldStatus : PolicyStatus as OldStatus
  private var _newStatus : PolicyStatus as NewStatus
  private var _timestamp : LocalDateTime as Timestamp
  private var _description : String as Description
  private var _performedBy : String as PerformedBy

  /**
   * Constructor initializing the entry with default "SYSTEM" performer.
   * 
   * @param policyId The ID of the associated policy.
   * @param type The type of transaction.
   * @param oldStatus The status before the transition.
   * @param newStatus The status after the transition.
   * @param description Audit trail description.
   */
  public construct(policyId : UUID, type : PolicyTransactionType, oldStatus : PolicyStatus, newStatus : PolicyStatus, description : String) {
    this(policyId, type, oldStatus, newStatus, description, "SYSTEM")
  }

  /**
   * Constructor initializing all fields including a custom performer.
   * 
   * @param policyId The ID of the associated policy.
   * @param type The type of transaction.
   * @param oldStatus The status before the transition.
   * @param newStatus The status after the transition.
   * @param description Audit trail description.
   * @param performedBy The user or system performing the action.
   */
  public construct(policyId : UUID, type : PolicyTransactionType, oldStatus : PolicyStatus, newStatus : PolicyStatus, description : String, performedBy : String) {
    if (policyId == null) {
      throw new IllegalArgumentException("Policy ID cannot be null")
    }
    if (type == null) {
      throw new IllegalArgumentException("TransactionType cannot be null")
    }
    if (newStatus == null) {
      throw new IllegalArgumentException("NewStatus cannot be null")
    }
    _id = UUID.randomUUID()
    _policyId = policyId
    _transactionType = type
    _oldStatus = oldStatus
    _newStatus = newStatus
    _timestamp = LocalDateTime.now()
    _description = description
    _performedBy = (performedBy == null || performedBy.trim().isEmpty()) ? "SYSTEM" : performedBy
  }
}
