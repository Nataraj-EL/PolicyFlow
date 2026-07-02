package policyflow.repository.claim

uses policyflow.domain.claim.Claim
uses java.util.ArrayList
uses java.util.List
uses java.util.UUID
uses java.util.concurrent.ConcurrentHashMap

/**
 * Thread-safe in-memory database implementation of {@link ClaimRepository}.
 */
public class InMemoryClaimRepository implements ClaimRepository {
  private var _db : ConcurrentHashMap<UUID, Claim> = new ConcurrentHashMap<UUID, Claim>()

  override function save(claim : Claim) : Claim {
    if (claim == null) {
      throw new IllegalArgumentException("Claim cannot be null")
    }
    if (claim.ID == null) {
      throw new IllegalArgumentException("Claim ID cannot be null")
    }
    _db.put(claim.ID, claim)
    return claim
  }

  override function findById(id : UUID) : Claim {
    if (id == null) {
      return null
    }
    return _db.get(id)
  }

  override function findByClaimNumber(claimNumber : String) : Claim {
    if (claimNumber == null || claimNumber.trim().isEmpty()) {
      return null
    }
    var cleanNumber = claimNumber.trim().toLowerCase()
    for (c in _db.values()) {
      var currentNumber = c.ClaimNumber ?: ""
      if (currentNumber.trim().toLowerCase().equals(cleanNumber)) {
        return c
      }
    }
    return null
  }

  override function findByPolicyId(policyId : UUID) : List<Claim> {
    var list = new ArrayList<Claim>()
    if (policyId == null) {
      return list
    }
    for (c in _db.values()) {
      if (policyId.equals(c.PolicyId)) {
        list.add(c)
      }
    }
    return list
  }

  override function findAll() : List<Claim> {
    return new ArrayList<Claim>(_db.values())
  }

  override function delete(id : UUID) {
    if (id != null) {
      _db.remove(id)
    }
  }

  override function clear() {
    _db.clear()
  }
}
