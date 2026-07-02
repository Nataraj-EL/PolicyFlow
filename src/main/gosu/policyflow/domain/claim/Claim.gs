package policyflow.domain.claim

uses java.time.LocalDate
uses java.util.UUID

/**
 * Represents a Claim aggregate in PolicyFlow.
 * Links to a Policy via UUID reference.
 * Features an auto-generated ClaimNumber and UUID ID.
 */
public class Claim {
  private var _id : UUID as readonly ID
  private var _claimNumber : String as ClaimNumber
  private var _policyId : UUID as PolicyId
  private var _claimType : ClaimType as ClaimType
  private var _status : ClaimStatus as Status = ClaimStatus.DRAFT
  private var _lossDate : LocalDate as LossDate
  private var _reportedDate : LocalDate as ReportedDate
  private var _description : String as Description
  private var _adjusterName : String as AdjusterName

  /**
   * Constructs a Claim, auto-generating the unique ID and unique ClaimNumber.
   */
  public construct() {
    _id = UUID.randomUUID()
    _claimNumber = "CLM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase()
  }
}
