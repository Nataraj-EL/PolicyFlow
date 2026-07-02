package policyflow.repository.claim

uses policyflow.domain.claim.Claim
uses java.util.ArrayList
uses java.util.List
uses java.util.UUID
uses java.util.concurrent.ConcurrentHashMap

/**
 * Thread-safe in-memory database implementation of {@link ClaimRepository}.
 * Employs a secondary index for fast O(1) ClaimNumber lookups.
 */
public class InMemoryClaimRepository implements ClaimRepository {
  private var _db : ConcurrentHashMap<UUID, Claim> = new ConcurrentHashMap<UUID, Claim>()
  private var _numberIndex = new ConcurrentHashMap<String, Claim>()

  override function save(claim : Claim) : Claim {
    if (claim == null) {
      throw new IllegalArgumentException("Claim cannot be null")
    }
    if (claim.ID == null) {
      throw new IllegalArgumentException("Claim ID cannot be null")
    }

    // Clean old index if updating
    var existing = _db.get(claim.ID)
    if (existing != null && existing.ClaimNumber != null) {
      _numberIndex.remove(existing.ClaimNumber.trim().toLowerCase())
    }

    _db.put(claim.ID, claim)

    if (claim.ClaimNumber != null && !claim.ClaimNumber.trim().isEmpty()) {
      _numberIndex.put(claim.ClaimNumber.trim().toLowerCase(), claim)
    }

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
    return _numberIndex.get(claimNumber.trim().toLowerCase())
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
    if (id == null) {
      return
    }
    var existing = _db.remove(id)
    if (existing != null && existing.ClaimNumber != null) {
      _numberIndex.remove(existing.ClaimNumber.trim().toLowerCase())
    }
  }

  override function clear() {
    _db.clear()
    _numberIndex.clear()
  }
}
