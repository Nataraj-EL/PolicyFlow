package policyflow.service.search

uses policyflow.domain.account.Contact
uses policyflow.domain.policy.Policy
uses policyflow.domain.claim.Claim
uses policyflow.domain.search.ContactSearchCriteria
uses policyflow.domain.search.PolicySearchCriteria
uses policyflow.domain.search.ClaimSearchCriteria
uses java.util.List

/**
 * Service interface for running advanced, multi-field cross-entity queries.
 */
public interface SearchService {
  /**
   * Searches Contacts based on multi-field criteria (FirstName, LastName, Email, VehicleMake).
   * All text filters are case-insensitive, trimmed, and null-safe.
   * 
   * @param criteria The search criteria.
   * @return A list of matching Contacts.
   */
  public function searchContacts(criteria : ContactSearchCriteria) : List<Contact>

  /**
   * Searches Policies based on criteria (PolicyNumber, ContactFirstName/LastName, Status, Type).
   * All text filters are case-insensitive, trimmed, and null-safe.
   * 
   * @param criteria The search criteria.
   * @return A list of matching Policies.
   */
  public function searchPolicies(criteria : PolicySearchCriteria) : List<Policy>

  /**
   * Searches Claims based on criteria (ClaimNumber, Status, Vin, ContactEmail).
   * All text filters are case-insensitive, trimmed, and null-safe.
   * 
   * @param criteria The search criteria.
   * @return A list of matching Claims.
   */
  public function searchClaims(criteria : ClaimSearchCriteria) : List<Claim>
}
