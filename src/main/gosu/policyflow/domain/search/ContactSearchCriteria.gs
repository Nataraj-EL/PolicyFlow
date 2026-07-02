package policyflow.domain.search

/**
 * Search parameter object for filtering Contacts.
 */
public class ContactSearchCriteria {
  private var _firstName : String as FirstName
  private var _lastName : String as LastName
  private var _email : String as Email
  private var _vehicleMake : String as VehicleMake

  /**
   * Default constructor.
   */
  public construct() {}
}
