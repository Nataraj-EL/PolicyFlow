package policyflow.service.policy

uses policyflow.domain.policy.Policy
uses policyflow.domain.policy.PolicyStatus
uses policyflow.domain.policy.PolicyType
uses policyflow.repository.policy.PolicyRepository
uses policyflow.repository.account.ContactRepository
uses policyflow.repository.vehicle.VehicleRepository
uses policyflow.validation.PolicyValidator
uses policyflow.validation.ValidationException
uses java.time.LocalDate
uses java.util.ArrayList
uses java.util.List
uses java.util.UUID

/**
 * Service implementation for managing Policy aggregates and workflows.
 */
public class PolicyServiceImpl implements PolicyService {
  private var _repository : PolicyRepository
  private var _contactRepository : ContactRepository
  private var _vehicleRepository : VehicleRepository

  /**
   * Constructs the service with repositories for Policy, Contact, and Vehicle.
   * 
   * @param policyRepo Data access repository for policies.
   * @param contactRepo Data access repository for contacts.
   * @param vehicleRepo Data access repository for vehicles.
   */
  public construct(policyRepo : PolicyRepository, contactRepo : ContactRepository, vehicleRepo : VehicleRepository) {
    if (policyRepo == null) {
      throw new IllegalArgumentException("PolicyRepository cannot be null")
    }
    if (contactRepo == null) {
      throw new IllegalArgumentException("ContactRepository cannot be null")
    }
    if (vehicleRepo == null) {
      throw new IllegalArgumentException("VehicleRepository cannot be null")
    }
    _repository = policyRepo
    _contactRepository = contactRepo
    _vehicleRepository = vehicleRepo
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

    return _repository.save(policy)
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

    return _repository.save(policy)
  }

  override function cancelPolicy(id : UUID, cancellationDate : LocalDate, reason : String) {
    if (id == null) {
      throw new IllegalArgumentException("Policy ID cannot be null")
    }

    var existing = _repository.findById(id)
    if (existing == null) {
      throw new IllegalArgumentException("Policy not found with ID: " + id)
    }

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
}
