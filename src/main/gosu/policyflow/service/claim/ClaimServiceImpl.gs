package policyflow.service.claim

uses policyflow.domain.claim.Claim
uses policyflow.domain.claim.ClaimStatus
uses policyflow.domain.claim.ClaimHistoryEntry
uses policyflow.domain.claim.ClaimTransactionType
uses policyflow.repository.claim.ClaimRepository
uses policyflow.repository.claim.ClaimHistoryRepository
uses policyflow.repository.policy.PolicyRepository
uses policyflow.validation.ClaimValidator
uses policyflow.validation.ValidationException
uses java.util.ArrayList
uses java.util.List
uses java.util.UUID

/**
 * Service implementation for managing claims lifecycle, validations, and audits.
 */
public class ClaimServiceImpl implements ClaimService {
  private var _repository : ClaimRepository
  private var _historyRepository : ClaimHistoryRepository
  private var _policyRepository : PolicyRepository

  /**
   * Primary constructor injecting repositories.
   * 
   * @param claimRepo The Claim repository.
   * @param historyRepo The Claim history repository.
   * @param policyRepo The Policy repository.
   */
  public construct(claimRepo : ClaimRepository, historyRepo : ClaimHistoryRepository, policyRepo : PolicyRepository) {
    if (claimRepo == null) {
      throw new IllegalArgumentException("ClaimRepository cannot be null")
    }
    if (historyRepo == null) {
      throw new IllegalArgumentException("ClaimHistoryRepository cannot be null")
    }
    if (policyRepo == null) {
      throw new IllegalArgumentException("PolicyRepository cannot be null")
    }
    _repository = claimRepo
    _historyRepository = historyRepo
    _policyRepository = policyRepo
  }

  override function fileClaim(claim : Claim) : Claim {
    if (claim == null) {
      throw new IllegalArgumentException("Claim cannot be null")
    }

    // Run business validation
    var valResult = ClaimValidator.validate(claim)
    if (!valResult.Success) {
      throw new ValidationException(valResult.Errors)
    }

    // Ensure linked policy exists
    var policy = _policyRepository.findById(claim.PolicyId)
    if (policy == null) {
      throw new IllegalArgumentException("Linked Policy does not exist with ID: " + claim.PolicyId)
    }

    // Enforce active policy check
    if (policy.Status != policyflow.domain.policy.PolicyStatus.IN_FORCE) {
      throw new IllegalArgumentException("Claims can only be filed against IN_FORCE policies. Current status is: " + policy.Status)
    }

    // Enforce term date boundary validation
    var lossDate = claim.LossDate
    if (lossDate != null && (lossDate.isBefore(policy.EffectiveDate) || lossDate.isAfter(policy.ExpirationDate))) {
      throw new IllegalArgumentException("Loss Date (" + lossDate + ") must fall within the Policy term: " + policy.EffectiveDate + " to " + policy.ExpirationDate)
    }

    // Validate ClaimNumber uniqueness
    var duplicate = findDuplicateClaimNumber(claim.ClaimNumber, null)
    if (duplicate) {
      throw new IllegalArgumentException("Claim Number already in use: " + claim.ClaimNumber)
    }

    // Set status to OPEN on filing
    claim.Status = ClaimStatus.OPEN

    var saved = _repository.save(claim)
    logHistory(saved.ID, ClaimTransactionType.CREATION, null, ClaimStatus.OPEN, "Claim filed and opened.")
    return saved
  }

  override function updateClaim(claim : Claim) : Claim {
    if (claim == null) {
      throw new IllegalArgumentException("Claim cannot be null")
    }
    if (claim.ID == null) {
      throw new IllegalArgumentException("Claim ID cannot be null")
    }

    var existing = _repository.findById(claim.ID)
    if (existing == null) {
      throw new IllegalArgumentException("Claim not found with ID: " + claim.ID)
    }

    // Prevent updates to CLOSED claims
    if (existing.Status == ClaimStatus.CLOSED) {
      throw new IllegalArgumentException("Closed claims cannot be updated.")
    }

    // Run business validation
    var valResult = ClaimValidator.validate(claim)
    if (!valResult.Success) {
      throw new ValidationException(valResult.Errors)
    }

    // Validate ClaimNumber uniqueness
    var duplicate = findDuplicateClaimNumber(claim.ClaimNumber, claim.ID)
    if (duplicate) {
      throw new IllegalArgumentException("Claim Number already in use: " + claim.ClaimNumber)
    }

    var oldStatus = existing.Status

    // Update details
    existing.ClaimNumber = claim.ClaimNumber
    existing.ClaimType = claim.ClaimType
    existing.Status = claim.Status
    existing.LossDate = claim.LossDate
    existing.ReportedDate = claim.ReportedDate
    existing.Description = claim.Description
    existing.AdjusterName = claim.AdjusterName

    var saved = _repository.save(existing)
    logHistory(saved.ID, ClaimTransactionType.UPDATE, oldStatus, saved.Status, "Claim details updated.")
    return saved
  }

  override function closeClaim(claimId : UUID, reason : String) {
    if (claimId == null) {
      throw new IllegalArgumentException("Claim ID cannot be null")
    }

    var existing = _repository.findById(claimId)
    if (existing == null) {
      throw new IllegalArgumentException("Claim not found with ID: " + claimId)
    }

    if (existing.Status == ClaimStatus.CLOSED) {
      throw new IllegalArgumentException("Claim is already closed.")
    }

    var oldStatus = existing.Status
    existing.Status = ClaimStatus.CLOSED
    _repository.save(existing)

    logHistory(existing.ID, ClaimTransactionType.CLOSE, oldStatus, ClaimStatus.CLOSED, "Claim closed. Reason: " + reason)
  }

  override function getClaim(id : UUID) : Claim {
    if (id == null) {
      throw new IllegalArgumentException("Claim ID cannot be null")
    }
    return _repository.findById(id)
  }

  override function getClaimByNumber(claimNumber : String) : Claim {
    if (claimNumber == null || claimNumber.trim().isEmpty()) {
      throw new IllegalArgumentException("Claim Number cannot be empty")
    }
    return _repository.findByClaimNumber(claimNumber)
  }

  override function searchClaims(claimNumberQuery : String, statusFilter : ClaimStatus, policyIdFilter : UUID) : List<Claim> {
    var results = _repository.findAll()

    var numClean = (claimNumberQuery != null) ? claimNumberQuery.trim().toLowerCase() : ""

    if (!numClean.isEmpty()) {
      var temp = new ArrayList<Claim>()
      for (c in results) {
        var num = c.ClaimNumber ?: ""
        if (num.toLowerCase().contains(numClean)) {
          temp.add(c)
        }
      }
      results = temp
    }

    if (statusFilter != null) {
      var temp = new ArrayList<Claim>()
      for (c in results) {
        if (c.Status == statusFilter) {
          temp.add(c)
        }
      }
      results = temp
    }

    if (policyIdFilter != null) {
      var temp = new ArrayList<Claim>()
      for (c in results) {
        if (policyIdFilter.equals(c.PolicyId)) {
          temp.add(c)
        }
      }
      results = temp
    }

    return results
  }

  override function getClaimHistory(claimId : UUID) : List<ClaimHistoryEntry> {
    if (claimId == null) {
      throw new IllegalArgumentException("Claim ID cannot be null")
    }
    return _historyRepository.findByClaimId(claimId)
  }

  /**
   * Helper function to detect duplicate ClaimNumber.
   */
  private function findDuplicateClaimNumber(claimNumber : String, excludeId : UUID) : boolean {
    if (claimNumber == null || claimNumber.trim().isEmpty()) {
      return false
    }
    var cleanNumber = claimNumber.trim().toLowerCase()
    for (c in _repository.findAll()) {
      if (excludeId == null || !c.ID.equals(excludeId)) {
        var currentNumber = c.ClaimNumber ?: ""
        if (currentNumber.trim().toLowerCase().equals(cleanNumber)) {
          return true
        }
      }
    }
    return false
  }

  /**
   * Helper function to log transition actions to the audit history repository.
   */
  private function logHistory(claimId : UUID, type : ClaimTransactionType, oldStatus : ClaimStatus, newStatus : ClaimStatus, description : String) {
    logHistory(claimId, type, oldStatus, newStatus, description, "SYSTEM")
  }

  /**
   * Helper function to log transition actions to the audit history repository with a performer.
   */
  private function logHistory(claimId : UUID, type : ClaimTransactionType, oldStatus : ClaimStatus, newStatus : ClaimStatus, description : String, performedBy : String) {
    var entry = new ClaimHistoryEntry(claimId, type, oldStatus, newStatus, description, performedBy)
    _historyRepository.save(entry)
  }
}
