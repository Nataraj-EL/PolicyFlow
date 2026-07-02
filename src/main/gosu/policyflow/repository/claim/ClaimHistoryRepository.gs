package policyflow.repository.claim

uses policyflow.domain.claim.ClaimHistoryEntry
uses java.util.List
uses java.util.UUID

/**
 * Data access interface for claim history logs.
 */
public interface ClaimHistoryRepository {
  /**
   * Saves a claim history entry to the repository.
   * 
   * @param entry The history entry to save.
   * @return The saved entry.
   */
  public function save(entry : ClaimHistoryEntry) : ClaimHistoryEntry

  /**
   * Retrieves all history entries associated with a specific claim.
   * 
   * @param claimId The ID of the claim.
   * @return List of history entries, sorted by timestamp.
   */
  public function findByClaimId(claimId : UUID) : List<ClaimHistoryEntry>

  /**
   * Retrieves all history entries in the repository.
   * 
   * @return List of all history entries.
   */
  public function findAll() : List<ClaimHistoryEntry>

  /**
   * Clears all history entries from the repository.
   */
  public function clear() : void
}
