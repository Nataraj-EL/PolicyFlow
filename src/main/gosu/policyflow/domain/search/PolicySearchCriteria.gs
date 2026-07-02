package policyflow.domain.search

uses policyflow.domain.policy.PolicyStatus
uses policyflow.domain.policy.PolicyType

/**
 * Search parameter object for filtering Policies.
 */
public class PolicySearchCriteria {
  private var _policyNumber : String as PolicyNumber
  private var _contactFirstName : String as ContactFirstName
  private var _contactLastName : String as ContactLastName
  private var _status : PolicyStatus as Status
  private var _type : PolicyType as Type

  /**
   * Default constructor.
   */
  public construct() {}
}
