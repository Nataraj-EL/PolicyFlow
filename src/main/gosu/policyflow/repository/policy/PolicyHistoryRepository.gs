package policyflow.repository.policy

uses policyflow.domain.policy.PolicyHistoryEntry
uses java.util.List
uses java.util.UUID

/**
 * Data access interface for policy audit history entries.
 */
public interface PolicyHistoryRepository {
  /**
   * Saves a policy history entry to the repository.
   * 
   * @param entry The history entry to save.
   * @return The saved entry.
   */
  public function save(entry : PolicyHistoryEntry) : PolicyHistoryEntry

  /**
   * Retrieves all history entries associated with a specific policy.
   * 
   * @param policyId The ID of the policy.
   * @return List of history entries, sorted by timestamp.
   */
  public function findByPolicyId(policyId : UUID) : List<PolicyHistoryEntry>

  /**
   * Retrieves all history entries in the repository.
   * 
   * @return List of all history entries.
   */
  public function findAll() : List<PolicyHistoryEntry>

  /**
   * Clears all history entries from the repository.
   */
  public function clear() : void
}
