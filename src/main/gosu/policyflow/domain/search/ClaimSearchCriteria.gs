package policyflow.domain.search

uses policyflow.domain.claim.ClaimStatus

/**
 * Search parameter object for filtering Claims.
 */
public class ClaimSearchCriteria {
  private var _claimNumber : String as ClaimNumber
  private var _status : ClaimStatus as Status
  private var _vin : String as Vin
  private var _contactEmail : String as ContactEmail

  /**
   * Default constructor.
   */
  public construct() {}
}
