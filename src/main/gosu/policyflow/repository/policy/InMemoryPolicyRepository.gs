package policyflow.repository.policy

uses policyflow.domain.policy.Policy
uses java.util.concurrent.ConcurrentHashMap
uses java.util.ArrayList
uses java.util.List
uses java.util.UUID

/**
 * Concurrent map-backed implementation of {@link PolicyRepository} for in-memory persistence.
 */
public class InMemoryPolicyRepository implements PolicyRepository {
  private var _db = new ConcurrentHashMap<UUID, Policy>()

  override function save(policy : Policy) : Policy {
    if (policy == null) {
      throw new IllegalArgumentException("Policy cannot be null")
    }
    if (policy.ID == null) {
      throw new IllegalArgumentException("Policy ID cannot be null")
    }
    _db.put(policy.ID, policy)
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
    var cleanNum = policyNumber.trim().toLowerCase()
    for (p in _db.values()) {
      var currentNum = p.PolicyNumber ?: ""
      if (currentNum.trim().toLowerCase().equals(cleanNum)) {
        return p
      }
    }
    return null
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
    return _db.remove(id) != null
  }

  override function clear() {
    _db.clear()
  }
}
