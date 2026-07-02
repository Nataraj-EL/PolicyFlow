package policyflow.repository.policy

uses policyflow.domain.policy.Policy
uses java.util.concurrent.ConcurrentHashMap
uses java.util.ArrayList
uses java.util.List
uses java.util.UUID

/**
 * Concurrent map-backed implementation of {@link PolicyRepository} for in-memory persistence.
 * Employs a secondary index for fast O(1) PolicyNumber lookups.
 */
public class InMemoryPolicyRepository implements PolicyRepository {
  private var _db = new ConcurrentHashMap<UUID, Policy>()
  private var _numberIndex = new ConcurrentHashMap<String, Policy>()

  override function save(policy : Policy) : Policy {
    if (policy == null) {
      throw new IllegalArgumentException("Policy cannot be null")
    }
    if (policy.ID == null) {
      throw new IllegalArgumentException("Policy ID cannot be null")
    }

    // Clean old index if updating
    var existing = _db.get(policy.ID)
    if (existing != null && existing.PolicyNumber != null) {
      _numberIndex.remove(existing.PolicyNumber.trim().toLowerCase())
    }

    _db.put(policy.ID, policy)

    if (policy.PolicyNumber != null && !policy.PolicyNumber.trim().isEmpty()) {
      _numberIndex.put(policy.PolicyNumber.trim().toLowerCase(), policy)
    }

    return policy
  }

  override function findById(id : UUID) : Policy {
    if (id == null) {
      return null
    }
    return _db.get(id)
  }

  override function findByPolicyNumber(policyNumber : String) : Policy {
    if (policyNumber == null || policyNumber.trim().isEmpty()) {
      return null
    }
    return _numberIndex.get(policyNumber.trim().toLowerCase())
  }

  override function findByVehicleId(vehicleId : UUID) : List<Policy> {
    var matches = new ArrayList<Policy>()
    if (vehicleId != null) {
      for (p in _db.values()) {
        if (vehicleId.equals(p.VehicleId)) {
          matches.add(p)
        }
      }
    }
    return matches
  }

  override function findAll() : List<Policy> {
    return new ArrayList<Policy>(_db.values())
  }

  override function delete(id : UUID) : boolean {
    if (id == null) {
      return false
    }
    var existing = _db.remove(id)
    if (existing != null) {
      if (existing.PolicyNumber != null) {
        _numberIndex.remove(existing.PolicyNumber.trim().toLowerCase())
      }
      return true
    }
    return false
  }

  override function clear() {
    _db.clear()
    _numberIndex.clear()
  }
}
