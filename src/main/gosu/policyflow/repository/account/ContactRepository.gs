package policyflow.repository.account

uses policyflow.domain.account.Contact
uses java.util.List
uses java.util.UUID

/**
 * Data access interface for managing Contact (Customer) entities in PolicyFlow.
 */
public interface ContactRepository {
  /**
   * Saves or updates a contact in the data store.
   * 
   * @param contact The contact to save.
   * @return The saved contact instance.
   */
  public function save(contact : Contact) : Contact

  /**
   * Finds a contact by its unique UUID.
   * 
   * @param id The unique identifier of the contact.
   * @return The contact if found, null otherwise.
   */
  public function findById(id : UUID) : Contact

  /**
   * Finds all contacts in the system.
   * 
   * @return A list of all contacts.
   */
  public function findAll() : List<Contact>

  /**
   * Deletes a contact from the data store by its UUID.
   * 
   * @param id The unique identifier of the contact.
   * @return true if the contact was found and deleted, false otherwise.
   */
  public function delete(id : UUID) : boolean

  /**
   * Clears all contacts from the data store.
   */
  public function clear() : void
}
