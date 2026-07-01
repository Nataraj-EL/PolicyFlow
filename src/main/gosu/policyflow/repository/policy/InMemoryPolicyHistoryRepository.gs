package policyflow.repository.policy

uses policyflow.domain.policy.PolicyHistoryEntry
uses java.util.ArrayList
uses java.util.Collections
uses java.util.Comparator
uses java.util.List
uses java.util.UUID
uses java.util.concurrent.ConcurrentHashMap

/**
 * Thread-safe, in-memory implementation of {@link PolicyHistoryRepository}.
 */
public class InMemoryPolicyHistoryRepository implements PolicyHistoryRepository {
  private var _db : ConcurrentHashMap<UUID, PolicyHistoryEntry> = new ConcurrentHashMap<UUID, PolicyHistoryEntry>()

  override function save(entry : PolicyHistoryEntry) : PolicyHistoryEntry {
    if (entry == null) {
      throw new IllegalArgumentException("History entry cannot be null")
    }
    _db.put(entry.ID, entry)
    return entry
  }

  override function findByPolicyId(policyId : UUID) : List<PolicyHistoryEntry> {
    if (policyId == null) {
      throw new IllegalArgumentException("Policy ID cannot be null")
    }
    var list = new ArrayList<PolicyHistoryEntry>()
    for (entry in _db.values()) {
      if (policyId.equals(entry.PolicyId)) {
        list.add(entry)
      }
    }
    // Sort by timestamp ascending
    Collections.sort(list, new Comparator<PolicyHistoryEntry>() {
      override function compare(o1 : PolicyHistoryEntry, o2 : PolicyHistoryEntry) : int {
        return o1.Timestamp.compareTo(o2.Timestamp)
      }
    })
    return list
  }

  override function findAll() : List<PolicyHistoryEntry> {
    return new ArrayList<PolicyHistoryEntry>(_db.values())
  }

  override function clear() {
    _db.clear()
  }
}
