package policyflow.domain.policy

uses java.time.LocalDate
uses java.util.UUID

/**
 * Represents a Policy aggregate contract in PolicyFlow.
 * Links to Contact and Vehicle aggregates via UUID references.
 * Features an auto-generated immutable policy number and {@link java.time.LocalDate} date types.
 */
public class Policy {
  private var _id : UUID as readonly ID
  private var _policyNumber : String as readonly PolicyNumber
  private var _policyType : PolicyType as PolicyType
  private var _status : PolicyStatus as Status = PolicyStatus.DRAFT
  private var _primaryNamedInsuredId : UUID as PrimaryNamedInsuredId
  private var _vehicleId : UUID as VehicleId
  private var _effectiveDate : LocalDate as EffectiveDate
  private var _expirationDate : LocalDate as ExpirationDate
  private var _cancellationDate : LocalDate as CancellationDate
  private var _cancellationReason : String as CancellationReason
  private var _previousPolicyId : UUID as PreviousPolicyId

  /**
   * Constructs a Policy, auto-generating the unique ID and immutable PolicyNumber.
   */
  public construct() {
    _id = UUID.randomUUID()
    _policyNumber = "POL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase()
  }
}
