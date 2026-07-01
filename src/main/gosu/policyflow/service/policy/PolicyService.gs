package policyflow.service.policy

uses policyflow.domain.policy.Policy
uses policyflow.domain.policy.PolicyStatus
uses policyflow.domain.policy.PolicyType
uses java.time.LocalDate
uses java.util.List
uses java.util.UUID

/**
 * Service interface for managing Policy aggregate lifecycles and transactions.
 */
public interface PolicyService {
  /**
   * Validates and creates a new Policy.
   * Assures that linked Contact and Vehicle exist, and checks active policy limits on vehicles.
   * 
   * @param policy The policy to create.
   * @return The created policy instance.
   * @throws IllegalArgumentException if references are missing or vehicle active policy limit is breached.
   * @throws policyflow.validation.ValidationException if validation rules fail.
   */
  public function createPolicy(policy : Policy) : Policy

  /**
   * Retrieves a policy by its unique UUID.
   * 
   * @param id The unique identifier of the policy.
   * @return The policy if found, null otherwise.
   */
  public function getPolicy(id : UUID) : Policy

  /**
   * Retrieves a policy by its unique PolicyNumber.
   * 
   * @param policyNumber The policy number to search.
   * @return The policy if found, null otherwise.
   */
  public function getPolicyByNumber(policyNumber : String) : Policy

  /**
   * Returns a list of all policies.
   * 
   * @return A list of all policies.
   */
  public function getAllPolicies() : List<Policy>

  /**
   * Validates and updates an existing Policy.
   * Ensures linked Contact and Vehicle exist, and checks active policy limits on vehicles.
   * 
   * @param policy The policy to update.
   * @return The updated policy instance.
   * @throws IllegalArgumentException if the policy is not found or validation checks fail.
   */
  public function updatePolicy(policy : Policy) : Policy

  /**
   * Cancels an active or draft policy.
   * Sets status to CANCELLED and requires a date and reason.
   * 
   * @param id The unique identifier of the policy.
   * @param cancellationDate The date of cancellation.
   * @param reason The reason for cancellation.
   * @throws IllegalArgumentException if policy not found, date/reason is empty or invalid.
   */
  public function cancelPolicy(id : UUID, cancellationDate : LocalDate, reason : String) : void

  /**
   * Searches policies by policy number, status, and/or policy type.
   * Filters are applied as an AND condition if multiple criteria are present.
   * 
   * @param policyNumberQuery The policy number query (optional).
   * @param statusFilter The policy status filter (optional).
   * @param typeFilter The policy type filter (optional).
   * @return A list of matching policies.
   */
  public function searchPolicies(policyNumberQuery : String, statusFilter : PolicyStatus, typeFilter : PolicyType) : List<Policy>

  /**
   * Renews a policy for a new term.
   * Creates a new Policy in DRAFT status, with a new PolicyNumber and PreviousPolicyId pointing to this policy.
   * 
   * @param policyId The unique identifier of the policy to renew.
   * @return The new renewed Policy term in DRAFT status.
   * @throws IllegalArgumentException if the policy is not found or is in an invalid state.
   */
  public function renewPolicy(policyId : UUID) : Policy

  /**
   * Marks an in-force policy as expired if the check date is on or after the expiration date.
   * 
   * @param policyId The unique identifier of the policy to expire.
   * @param checkDate The date to evaluate expiration against.
   * @throws IllegalArgumentException if the policy is not in-force or is not yet eligible to expire.
   */
  public function expirePolicy(policyId : UUID, checkDate : LocalDate) : void

  /**
   * Reinstates a cancelled policy back to IN_FORCE status, retaining cancellation details.
   * 
   * @param policyId The unique identifier of the policy to reinstate.
   * @param reason The reason for reinstatement.
   * @throws IllegalArgumentException if the policy is not cancelled.
   */
  public function reinstatePolicy(policyId : UUID, reason : String) : void

  /**
   * Endorses (changes) details of an in-force policy.
   * 
   * @param policy The updated policy object.
   * @param description A summary of the endorsement changes.
   * @return The updated and persisted policy instance.
   * @throws IllegalArgumentException if the policy is not in-force or cannot be endorsed.
   */
  public function endorsePolicy(policy : Policy, description : String) : Policy

  /**
   * Retrieves the complete transaction audit history for a policy.
   * 
   * @param policyId The unique identifier of the policy.
   * @return Sorted list of history entries representing transitions.
   */
  public function getPolicyHistory(policyId : UUID) : List<policyflow.domain.policy.PolicyHistoryEntry>
}
