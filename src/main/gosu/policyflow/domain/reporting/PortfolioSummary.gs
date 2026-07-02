package policyflow.domain.reporting

uses policyflow.domain.policy.PolicyStatus
uses policyflow.domain.policy.PolicyType
uses policyflow.domain.claim.ClaimStatus
uses policyflow.domain.claim.ClaimType
uses policyflow.domain.vehicle.VehicleType
uses policyflow.domain.account.ContactType
uses java.math.BigDecimal
uses java.time.LocalDateTime
uses java.util.HashMap
uses java.util.Map

/**
 * Model class compiled by {@link policyflow.service.reporting.ReportingService}
 * to represent portfolio statistics and distributions.
 */
public class PortfolioSummary {
  private var _activePoliciesCount : int as ActivePoliciesCount = 0
  private var _openClaimsCount : int as OpenClaimsCount = 0
  private var _totalPremium : BigDecimal as TotalPremium = BigDecimal.ZERO
  private var _generatedAt : LocalDateTime as GeneratedAt

  private var _policiesByStatus : Map<PolicyStatus, Integer> as PoliciesByStatus = new HashMap<PolicyStatus, Integer>()
  private var _policiesByType : Map<PolicyType, Integer> as PoliciesByType = new HashMap<PolicyType, Integer>()
  private var _claimsByStatus : Map<ClaimStatus, Integer> as ClaimsByStatus = new HashMap<ClaimStatus, Integer>()
  private var _claimsByType : Map<ClaimType, Integer> as ClaimsByType = new HashMap<ClaimType, Integer>()
  private var _vehiclesByType : Map<VehicleType, Integer> as VehiclesByType = new HashMap<VehicleType, Integer>()
  private var _contactsByType : Map<ContactType, Integer> as ContactsByType = new HashMap<ContactType, Integer>()

  /**
   * Default constructor setting the generation timestamp.
   */
  public construct() {
    _generatedAt = LocalDateTime.now()
  }
}
