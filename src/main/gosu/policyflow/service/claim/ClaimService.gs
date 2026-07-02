package policyflow.service.claim

uses policyflow.domain.claim.Claim
uses policyflow.domain.claim.ClaimStatus
uses policyflow.domain.claim.ClaimHistoryEntry
uses java.util.List
uses java.util.UUID

/**
 * Service interface for managing Claim lifecycle workflows, filing, closing, and updates.
 */
public interface ClaimService {
  /**
   * Files a new claim. Sets status to OPEN, validates invariants, and links to an active policy.
   * 
   * @param claim The claim to file.
   * @return The filed claim.
   * @throws IllegalArgumentException if references are missing or the policy is not in force.
   * @throws policyflow.validation.ValidationException if validation rules fail.
   */
  public function fileClaim(claim : Claim) : Claim

  /**
   * Updates an existing open claim. Prevents modifications if the claim is closed.
   * 
   * @param claim The claim with updated details.
   * @return The updated claim.
   * @throws IllegalArgumentException if the claim is not found or is closed.
   * @throws policyflow.validation.ValidationException if validation rules fail.
   */
  public function updateClaim(claim : Claim) : Claim

  /**
   * Closes an open claim with a closing reason.
   * 
   * @param claimId The claim identifier.
   * @param reason The closing reason.
   * @throws IllegalArgumentException if the claim is not found or is already closed.
   */
  public function closeClaim(claimId : UUID, reason : String) : void

  /**
   * Retrieves a claim by its unique ID.
   * 
   * @param id The unique identifier.
   * @return The claim if found, null otherwise.
   */
  public function getClaim(id : UUID) : Claim

  /**
   * Retrieves a claim by its unique ClaimNumber.
   * 
   * @param claimNumber The claim number.
   * @return The claim if found, null otherwise.
   */
  public function getClaimByNumber(claimNumber : String) : Claim

  /**
   * Searches claims by claim number, status, and/or policy ID.
   * Filters are combined as AND conditions.
   * 
   * @param claimNumberQuery Search query for claim number.
   * @param statusFilter Filter for claim status.
   * @param policyIdFilter Filter for linked policy ID.
   * @return List of matching claims.
   */
  public function searchClaims(claimNumberQuery : String, statusFilter : ClaimStatus, policyIdFilter : UUID) : List<Claim>

  /**
   * Retrieves the complete transaction audit history for a claim.
   * 
   * @param claimId The unique identifier of the claim.
   * @return Sorted list of history entries.
   */
  public function getClaimHistory(claimId : UUID) : List<ClaimHistoryEntry>
}
