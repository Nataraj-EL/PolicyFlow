package policyflow.repository.claim

uses policyflow.domain.claim.ClaimHistoryEntry
uses java.util.ArrayList
uses java.util.Collections
uses java.util.Comparator
uses java.util.List
uses java.util.UUID
uses java.util.concurrent.ConcurrentHashMap

/**
 * Thread-safe, in-memory implementation of {@link ClaimHistoryRepository}.
 */
public class InMemoryClaimHistoryRepository implements ClaimHistoryRepository {
  private var _db : ConcurrentHashMap<UUID, ClaimHistoryEntry> = new ConcurrentHashMap<UUID, ClaimHistoryEntry>()

  override function save(entry : ClaimHistoryEntry) : ClaimHistoryEntry {
    if (entry == null) {
      throw new IllegalArgumentException("History entry cannot be null")
    }
    _db.put(entry.ID, entry)
    return entry
  }

  override function findByClaimId(claimId : UUID) : List<ClaimHistoryEntry> {
    if (claimId == null) {
      throw new IllegalArgumentException("Claim ID cannot be null")
    }
    var list = new ArrayList<ClaimHistoryEntry>()
    for (entry in _db.values()) {
      if (claimId.equals(entry.ClaimId)) {
        list.add(entry)
      }
    }
    // Sort by timestamp ascending
    Collections.sort(list, new Comparator<ClaimHistoryEntry>() {
      override function compare(o1 : ClaimHistoryEntry, o2 : ClaimHistoryEntry) : int {
        return o1.Timestamp.compareTo(o2.Timestamp)
      }
    })
    return list
  }

  override function findAll() : List<ClaimHistoryEntry> {
    return new ArrayList<ClaimHistoryEntry>(_db.values())
  }

  override function clear() {
    _db.clear()
  }
}
