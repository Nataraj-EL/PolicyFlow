package policyflow.service.policy

uses policyflow.domain.policy.Policy
uses policyflow.domain.policy.PolicyStatus
uses policyflow.domain.policy.PolicyType
uses policyflow.domain.policy.PolicyHistoryEntry
uses policyflow.domain.policy.PolicyTransactionType
uses policyflow.repository.policy.PolicyRepository
uses policyflow.repository.policy.PolicyHistoryRepository
uses policyflow.repository.policy.InMemoryPolicyHistoryRepository
uses policyflow.repository.account.ContactRepository
uses policyflow.repository.vehicle.VehicleRepository
uses policyflow.validation.PolicyValidator
uses policyflow.validation.ValidationException
uses java.time.LocalDate
uses java.util.ArrayList
uses java.util.List
uses java.util.UUID

/**
 * Service implementation for managing Policy aggregates, lifecycle transitions, and audit logs.
 */
public class PolicyServiceImpl implements PolicyService {
  private var _repository : PolicyRepository
  private var _contactRepository : ContactRepository
  private var _vehicleRepository : VehicleRepository
  private var _historyRepository : PolicyHistoryRepository

  /**
   * Compatibility constructor that defaults the history repository.
   * 
   * @param policyRepo Data access repository for policies.
   * @param contactRepo Data access repository for contacts.
   * @param vehicleRepo Data access repository for vehicles.
   */
  public construct(policyRepo : PolicyRepository, contactRepo : ContactRepository, vehicleRepo : VehicleRepository) {
    this(policyRepo, contactRepo, vehicleRepo, new InMemoryPolicyHistoryRepository())
  }

  /**
   * Primary constructor injecting all repositories.
   * 
   * @param policyRepo Data access repository for policies.
   * @param contactRepo Data access repository for contacts.
   * @param vehicleRepo Data access repository for vehicles.
   * @param historyRepo Data access repository for policy history.
   */
  public construct(policyRepo : PolicyRepository, contactRepo : ContactRepository, vehicleRepo : VehicleRepository, historyRepo : PolicyHistoryRepository) {
    if (policyRepo == null) {
      throw new IllegalArgumentException("PolicyRepository cannot be null")
    }
    if (contactRepo == null) {
      throw new IllegalArgumentException("ContactRepository cannot be null")
    }
    if (vehicleRepo == null) {
      throw new IllegalArgumentException("VehicleRepository cannot be null")
    }
    if (historyRepo == null) {
      throw new IllegalArgumentException("PolicyHistoryRepository cannot be null")
    }
    _repository = policyRepo
    _contactRepository = contactRepo
    _vehicleRepository = vehicleRepo
    _historyRepository = historyRepo
  }

  override function createPolicy(policy : Policy) : Policy {
    if (policy == null) {
      throw new IllegalArgumentException("Policy cannot be null")
    }

    // Run business validation
    var valResult = PolicyValidator.validate(policy)
    if (!valResult.Success) {
      throw new ValidationException(valResult.Errors)
    }

    // Reference validation
    validateLinkedEntities(policy)

    // Uniqueness constraint check (active policies per vehicle)
    if (policy.Status == PolicyStatus.IN_FORCE) {
      validateActivePolicyConstraint(policy)
    }

    var saved = _repository.save(policy)
    logHistory(saved.ID, PolicyTransactionType.CREATION, null, saved.Status, "Policy created with status " + saved.Status)
    return saved
  }

  override function getPolicy(id : UUID) : Policy {
    if (id == null) {
      throw new IllegalArgumentException("Policy ID cannot be null")
    }
    return _repository.findById(id)
  }

  override function getPolicyByNumber(policyNumber : String) : Policy {
    if (policyNumber == null || policyNumber.trim().isEmpty()) {
      throw new IllegalArgumentException("Policy Number cannot be empty")
    }
    return _repository.findByPolicyNumber(policyNumber)
  }

  override function getAllPolicies() : List<Policy> {
    return _repository.findAll()
  }

  override function updatePolicy(policy : Policy) : Policy {
    if (policy == null) {
      throw new IllegalArgumentException("Policy cannot be null")
    }
    if (policy.ID == null) {
      throw new IllegalArgumentException("Policy ID cannot be null")
    }

    // Verify policy exists
    var existing = _repository.findById(policy.ID)
    if (existing == null) {
      throw new IllegalArgumentException("Policy not found with ID: " + policy.ID)
    }

    var oldStatus = existing.Status

    // Run business validation
    var valResult = PolicyValidator.validate(policy)
    if (!valResult.Success) {
      throw new ValidationException(valResult.Errors)
    }

    // Reference validation
    validateLinkedEntities(policy)

    // Uniqueness constraint check (active policies per vehicle)
    if (policy.Status == PolicyStatus.IN_FORCE) {
      validateActivePolicyConstraint(policy)
    }

    var saved = _repository.save(policy)
    logHistory(saved.ID, PolicyTransactionType.ENDORSEMENT, oldStatus, saved.Status, "Policy updated/modified via direct update")
    return saved
  }

  override function cancelPolicy(id : UUID, cancellationDate : LocalDate, reason : String) {
    if (id == null) {
      throw new IllegalArgumentException("Policy ID cannot be null")
    }

    var existing = _repository.findById(id)
    if (existing == null) {
      throw new IllegalArgumentException("Policy not found with ID: " + id)
    }

    var oldStatus = existing.Status

    // Apply cancellation fields
    existing.Status = PolicyStatus.CANCELLED
    existing.CancellationDate = cancellationDate
    existing.CancellationReason = reason

    // Run full validation to enforce cancellation invariants
    var valResult = PolicyValidator.validate(existing)
    if (!valResult.Success) {
      throw new ValidationException(valResult.Errors)
    }

    _repository.save(existing)
    logHistory(existing.ID, PolicyTransactionType.CANCELLATION, oldStatus, PolicyStatus.CANCELLED, "Policy cancelled. Reason: " + reason)
  }

  override function renewPolicy(policyId : UUID) : Policy {
    if (policyId == null) {
      throw new IllegalArgumentException("Policy ID cannot be null")
    }

    var existing = _repository.findById(policyId)
    if (existing == null) {
      throw new IllegalArgumentException("Policy not found with ID: " + policyId)
    }

    if (existing.Status != PolicyStatus.IN_FORCE && existing.Status != PolicyStatus.EXPIRED) {
      throw new IllegalArgumentException("Only IN_FORCE or EXPIRED policies can be renewed")
    }

    // Create renewed policy
    var renewed = new Policy()
    renewed.PolicyType = existing.PolicyType
    renewed.Status = PolicyStatus.DRAFT
    renewed.PrimaryNamedInsuredId = existing.PrimaryNamedInsuredId
    renewed.VehicleId = existing.VehicleId
    renewed.EffectiveDate = existing.ExpirationDate
    renewed.ExpirationDate = renewed.EffectiveDate.plusYears(1)
    renewed.PreviousPolicyId = existing.ID

    var savedRenewed = _repository.save(renewed)

    // Log transitions on both policies
    logHistory(existing.ID, PolicyTransactionType.RENEWAL, existing.Status, existing.Status, "Renewal term initiated: " + savedRenewed.PolicyNumber)
    logHistory(savedRenewed.ID, PolicyTransactionType.CREATION, null, PolicyStatus.DRAFT, "Created via renewal from policy term ID: " + existing.ID)

    return savedRenewed
  }

  override function expirePolicy(policyId : UUID, checkDate : LocalDate) {
    if (policyId == null) {
      throw new IllegalArgumentException("Policy ID cannot be null")
    }
    if (checkDate == null) {
      throw new IllegalArgumentException("Check date cannot be null")
    }

    var policy = _repository.findById(policyId)
    if (policy == null) {
      throw new IllegalArgumentException("Policy not found with ID: " + policyId)
    }

    if (policy.Status != PolicyStatus.IN_FORCE) {
      throw new IllegalArgumentException("Only IN_FORCE policies can expire")
    }

    if (checkDate.isBefore(policy.ExpirationDate)) {
      throw new IllegalArgumentException("Policy cannot be expired before its expiration date: " + policy.ExpirationDate)
    }

    var oldStatus = policy.Status
    policy.Status = PolicyStatus.EXPIRED
    _repository.save(policy)

    logHistory(policy.ID, PolicyTransactionType.EXPIRATION, oldStatus, PolicyStatus.EXPIRED, "Policy expired on date: " + checkDate)
  }

  override function reinstatePolicy(policyId : UUID, reason : String) {
    if (policyId == null) {
      throw new IllegalArgumentException("Policy ID cannot be null")
    }

    var policy = _repository.findById(policyId)
    if (policy == null) {
      throw new IllegalArgumentException("Policy not found with ID: " + policyId)
    }

    if (policy.Status != PolicyStatus.CANCELLED) {
      throw new IllegalArgumentException("Only CANCELLED policies can be reinstated")
    }

    var oldStatus = policy.Status
    policy.Status = PolicyStatus.IN_FORCE
    // Cancellation Date/Reason are preserved for historical integrity as per user request

    // Verify active policy constraint before bringing back to IN_FORCE
    validateActivePolicyConstraint(policy)

    _repository.save(policy)

    logHistory(policy.ID, PolicyTransactionType.REINSTATEMENT, oldStatus, PolicyStatus.IN_FORCE, "Policy reinstated. Reason: " + reason)
  }

  override function endorsePolicy(policy : Policy, description : String) : Policy {
    if (policy == null) {
      throw new IllegalArgumentException("Policy cannot be null")
    }
    if (policy.ID == null) {
      throw new IllegalArgumentException("Policy ID cannot be null")
    }

    var existing = _repository.findById(policy.ID)
    if (existing == null) {
      throw new IllegalArgumentException("Policy not found with ID: " + policy.ID)
    }

    if (existing.Status != PolicyStatus.IN_FORCE) {
      throw new IllegalArgumentException("Only IN_FORCE policies can be endorsed")
    }

    // Run business validation
    var valResult = PolicyValidator.validate(policy)
    if (!valResult.Success) {
      throw new ValidationException(valResult.Errors)
    }

    // Reference validation
    validateLinkedEntities(policy)

    // Uniqueness constraint check (active policies per vehicle)
    validateActivePolicyConstraint(policy)

    // Apply updates to the existing record
    existing.PrimaryNamedInsuredId = policy.PrimaryNamedInsuredId
    existing.VehicleId = policy.VehicleId
    existing.EffectiveDate = policy.EffectiveDate
    existing.ExpirationDate = policy.ExpirationDate
    existing.CancellationDate = policy.CancellationDate
    existing.CancellationReason = policy.CancellationReason
    existing.Status = policy.Status
    existing.PolicyType = policy.PolicyType

    var saved = _repository.save(existing)
    logHistory(saved.ID, PolicyTransactionType.ENDORSEMENT, PolicyStatus.IN_FORCE, PolicyStatus.IN_FORCE, "Endorsement: " + description)

    return saved
  }

  override function getPolicyHistory(policyId : UUID) : List<PolicyHistoryEntry> {
    if (policyId == null) {
      throw new IllegalArgumentException("Policy ID cannot be null")
    }
    return _historyRepository.findByPolicyId(policyId)
  }

  override function searchPolicies(policyNumberQuery : String, statusFilter : PolicyStatus, typeFilter : PolicyType) : List<Policy> {
    var results = _repository.findAll()

    var numClean = (policyNumberQuery != null) ? policyNumberQuery.trim().toLowerCase() : ""

    if (!numClean.isEmpty()) {
      var temp = new ArrayList<Policy>()
      for (p in results) {
        var num = p.PolicyNumber ?: ""
        if (num.toLowerCase().equals(numClean)) {
          temp.add(p)
        }
      }
      results = temp
    }

    if (statusFilter != null) {
      var temp = new ArrayList<Policy>()
      for (p in results) {
        if (p.Status == statusFilter) {
          temp.add(p)
        }
      }
      results = temp
    }

    if (typeFilter != null) {
      var temp = new ArrayList<Policy>()
      for (p in results) {
        if (p.PolicyType == typeFilter) {
          temp.add(p)
        }
      }
      results = temp
    }

    return results
  }

  /**
   * Helper function to validate references to related aggregates.
   * 
   * @param policy The policy to check.
   */
  private function validateLinkedEntities(policy : Policy) {
    var contact = _contactRepository.findById(policy.PrimaryNamedInsuredId)
    if (contact == null) {
      throw new IllegalArgumentException("Linked Contact does not exist with ID: " + policy.PrimaryNamedInsuredId)
    }

    var vehicle = _vehicleRepository.findById(policy.VehicleId)
    if (vehicle == null) {
      throw new IllegalArgumentException("Linked Vehicle does not exist with ID: " + policy.VehicleId)
    }
  }

  /**
   * Helper function to assert that a vehicle does not have more than one IN_FORCE policy.
   * 
   * @param policy The policy being saved/activated.
   */
  private function validateActivePolicyConstraint(policy : Policy) {
    var vehiclePolicies = _repository.findByVehicleId(policy.VehicleId)
    for (vp in vehiclePolicies) {
      if (vp.Status == PolicyStatus.IN_FORCE && !vp.ID.equals(policy.ID)) {
        throw new IllegalArgumentException("Vehicle already has an active IN_FORCE policy with number: " + vp.PolicyNumber)
      }
    }
  }

  /**
   * Helper function to log transition actions to the audit history repository.
   */
  private function logHistory(policyId : UUID, type : PolicyTransactionType, oldStatus : PolicyStatus, newStatus : PolicyStatus, description : String) {
    logHistory(policyId, type, oldStatus, newStatus, description, "SYSTEM")
  }

  /**
   * Helper function to log transition actions to the audit history repository with a performer.
   */
  private function logHistory(policyId : UUID, type : PolicyTransactionType, oldStatus : PolicyStatus, newStatus : PolicyStatus, description : String, performedBy : String) {
    var entry = new PolicyHistoryEntry(policyId, type, oldStatus, newStatus, description, performedBy)
    _historyRepository.save(entry)
  }
}
