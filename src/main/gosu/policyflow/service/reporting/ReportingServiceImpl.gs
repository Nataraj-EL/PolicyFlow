package policyflow.service.reporting

uses policyflow.domain.reporting.PortfolioSummary
uses policyflow.domain.policy.PolicyStatus
uses policyflow.domain.policy.PolicyType
uses policyflow.domain.claim.ClaimStatus
uses policyflow.domain.claim.ClaimType
uses policyflow.domain.vehicle.VehicleType
uses policyflow.domain.account.ContactType
uses policyflow.repository.policy.PolicyRepository
uses policyflow.repository.claim.ClaimRepository
uses policyflow.repository.vehicle.VehicleRepository
uses policyflow.repository.account.ContactRepository
uses policyflow.service.rating.PremiumCalculationService
uses java.math.BigDecimal
uses java.util.Map

/**
 * Service implementation for compiling portfolio summaries.
 */
public class ReportingServiceImpl implements ReportingService {
  private var _policyRepo : PolicyRepository
  private var _claimRepo : ClaimRepository
  private var _vehicleRepo : VehicleRepository
  private var _contactRepo : ContactRepository
  private var _premiumService : PremiumCalculationService

  /**
   * Primary constructor injecting all dependencies.
   * 
   * @param policyRepo The Policy repository.
   * @param claimRepo The Claim repository.
   * @param vehicleRepo The Vehicle repository.
   * @param contactRepo The Contact repository.
   * @param premiumService The Premium calculation service.
   */
  public construct(policyRepo : PolicyRepository, claimRepo : ClaimRepository, vehicleRepo : VehicleRepository, contactRepo : ContactRepository, premiumService : PremiumCalculationService) {
    if (policyRepo == null || claimRepo == null || vehicleRepo == null || contactRepo == null || premiumService == null) {
      throw new IllegalArgumentException("Dependencies cannot be null")
    }
    _policyRepo = policyRepo
    _claimRepo = claimRepo
    _vehicleRepo = vehicleRepo
    _contactRepo = contactRepo
    _premiumService = premiumService
  }

  override function generatePortfolioSummary() : PortfolioSummary {
    var summary = new PortfolioSummary()

    // 1. Process Policies
    var policies = _policyRepo.findAll()
    for (p in policies) {
      incrementMap(summary.PoliciesByStatus, p.Status)
      incrementMap(summary.PoliciesByType, p.PolicyType)

      if (p.Status == PolicyStatus.IN_FORCE) {
        summary.ActivePoliciesCount = summary.ActivePoliciesCount + 1

        // Retrieve vehicle and contact to calculate active premium dynamically
        var vehicle = _vehicleRepo.findById(p.VehicleId)
        var contact = _contactRepo.findById(p.PrimaryNamedInsuredId)
        if (vehicle != null && contact != null) {
          var breakdown = _premiumService.calculatePremium(vehicle, contact)
          if (breakdown != null && breakdown.TotalPremium != null) {
            summary.TotalPremium = summary.TotalPremium.add(breakdown.TotalPremium)
          }
        }
      }
    }

    // 2. Process Claims
    var claims = _claimRepo.findAll()
    for (c in claims) {
      incrementMap(summary.ClaimsByStatus, c.Status)
      incrementMap(summary.ClaimsByType, c.ClaimType)

      if (c.Status == ClaimStatus.OPEN) {
        summary.OpenClaimsCount = summary.OpenClaimsCount + 1
      }
    }

    // 3. Process Vehicles
    var vehicles = _vehicleRepo.findAll()
    for (v in vehicles) {
      incrementMap(summary.VehiclesByType, v.VehicleType)
    }

    // 4. Process Contacts
    var contacts = _contactRepo.findAll()
    for (ct in contacts) {
      incrementMap(summary.ContactsByType, ct.ContactType)
    }

    return summary
  }

  /**
   * Helper function to safely increment key count in a map.
   */
  private function incrementMap<K>(map : Map<K, Integer>, key : K) {
    if (key != null) {
      var count = map.get(key)
      if (count == null) {
        map.put(key, 1)
      } else {
        map.put(key, count + 1)
      }
    }
  }
}
