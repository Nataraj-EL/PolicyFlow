package policyflow.repository.claim

uses policyflow.domain.claim.Claim
uses java.util.List
uses java.util.UUID

/**
 * Data access interface for Claim aggregates.
 */
public interface ClaimRepository {
  /**
   * Saves a claim to the repository.
   * 
   * @param claim The claim to save.
   * @return The saved claim.
   */
  public function save(claim : Claim) : Claim

  /**
   * Retrieves a claim by its unique ID.
   * 
   * @param id The unique identifier.
   * @return The claim if found, null otherwise.
   */
  public function findById(id : UUID) : Claim

  /**
   * Retrieves a claim by its unique ClaimNumber.
   * 
   * @param claimNumber The claim number.
   * @return The claim if found, null otherwise.
   */
  public function findByClaimNumber(claimNumber : String) : Claim

  /**
   * Retrieves all claims associated with a policy ID.
   * 
   * @param policyId The policy identifier.
   * @return List of claims.
   */
  public function findByPolicyId(policyId : UUID) : List<Claim>

  /**
   * Retrieves all claims in the database.
   * 
   * @return List of all claims.
   */
  public function findAll() : List<Claim>

  /**
   * Deletes a claim by its ID.
   * 
   * @param id The claim identifier.
   */
  public function delete(id : UUID) : void

  /**
   * Clears the repository.
   */
  public function clear() : void
}
