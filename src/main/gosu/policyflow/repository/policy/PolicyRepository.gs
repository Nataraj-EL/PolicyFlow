package policyflow.repository.policy

uses policyflow.domain.policy.Policy
uses java.util.List
uses java.util.UUID

/**
 * Data access interface for managing Policy entities in PolicyFlow.
 */
public interface PolicyRepository {
  /**
   * Saves or updates a policy in the data store.
   * 
   * @param policy The policy to save.
   * @return The saved policy instance.
   */
  public function save(policy : Policy) : Policy

  /**
   * Finds a policy by its unique UUID.
   * 
   * @param id The unique identifier of the policy.
   * @return The policy if found, null otherwise.
   */
  public function findById(id : UUID) : Policy

  /**
   * Finds a policy by its unique PolicyNumber.
   * 
   * @param policyNumber The policy number to search.
   * @return The policy if found, null otherwise.
   */
  public function findByPolicyNumber(policyNumber : String) : Policy

  /**
   * Finds all policies linked to a specific VehicleId.
   * 
   * @param vehicleId The vehicle UUID.
   * @return A list of policies referencing the vehicle.
   */
  public function findByVehicleId(vehicleId : UUID) : List<Policy>

  /**
   * Finds all policies in the system.
   * 
   * @return A list of all policies.
   */
  public function findAll() : List<Policy>

  /**
   * Deletes a policy from the data store by its UUID.
   * 
   * @param id The unique identifier of the policy.
   * @return true if the policy was found and deleted, false otherwise.
   */
  public function delete(id : UUID) : boolean

  /**
   * Clears all policies from the data store.
   */
  public function clear() : void
}
