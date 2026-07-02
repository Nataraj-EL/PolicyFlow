package policyflow.domain.claim

uses java.time.LocalDateTime
uses java.util.UUID

/**
 * Audit history entry documenting a state transition or update to a Claim.
 */
public class ClaimHistoryEntry {
  private var _id : UUID as readonly ID
  private var _claimId : UUID as ClaimId
  private var _transactionType : ClaimTransactionType as TransactionType
  private var _oldStatus : ClaimStatus as OldStatus
  private var _newStatus : ClaimStatus as NewStatus
  private var _timestamp : LocalDateTime as Timestamp
  private var _description : String as Description
  private var _performedBy : String as PerformedBy

  /**
   * Constructor initializing the entry with default "SYSTEM" performer.
   * 
   * @param claimId The ID of the associated claim.
   * @param type The type of transaction.
   * @param oldStatus The status before the transition.
   * @param newStatus The status after the transition.
   * @param description Audit trail description.
   */
  public construct(claimId : UUID, type : ClaimTransactionType, oldStatus : ClaimStatus, newStatus : ClaimStatus, description : String) {
    this(claimId, type, oldStatus, newStatus, description, "SYSTEM")
  }

  /**
   * Constructor initializing all fields including a custom performer.
   * 
   * @param claimId The ID of the associated claim.
   * @param type The type of transaction.
   * @param oldStatus The status before the transition.
   * @param newStatus The status after the transition.
   * @param description Audit trail description.
   * @param performedBy The user or system performing the action.
   */
  public construct(claimId : UUID, type : ClaimTransactionType, oldStatus : ClaimStatus, newStatus : ClaimStatus, description : String, performedBy : String) {
    if (claimId == null) {
      throw new IllegalArgumentException("Claim ID cannot be null")
    }
    if (type == null) {
      throw new IllegalArgumentException("TransactionType cannot be null")
    }
    if (newStatus == null) {
      throw new IllegalArgumentException("NewStatus cannot be null")
    }
    _id = UUID.randomUUID()
    _claimId = claimId
    _transactionType = type
    _oldStatus = oldStatus
    _newStatus = newStatus
    _timestamp = LocalDateTime.now()
    _description = description
    _performedBy = (performedBy == null || performedBy.trim().isEmpty()) ? "SYSTEM" : performedBy
  }
}
