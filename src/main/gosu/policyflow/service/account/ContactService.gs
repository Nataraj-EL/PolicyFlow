package policyflow.service.account

uses policyflow.domain.account.Contact
uses java.util.List
uses java.util.UUID

/**
 * Service interface for managing customer Contact (Customer) lifecycle workflows.
 */
public interface ContactService {
  /**
   * Validates, checks for duplicates, and creates a new contact in the persistence store.
   * 
   * @param contact The contact object to create.
   * @return The created contact instance.
   * @throws IllegalArgumentException if validation fails or a duplicate email is detected.
   */
  public function createContact(contact : Contact) : Contact

  /**
   * Retrieves a contact by its unique UUID.
   * 
   * @param id The unique identifier of the contact.
   * @return The contact if found, null otherwise.
   */
  public function getContact(id : UUID) : Contact

  /**
   * Returns a list of all contacts currently registered.
   * 
   * @return A list of all contacts.
   */
  public function getAllContacts() : List<Contact>

  /**
   * Validates and updates the details of an existing contact.
   * Enforces ID immutability and duplicate email checking for other records.
   * 
   * @param contact The contact details to update.
   * @return The updated contact instance.
   * @throws IllegalArgumentException if the contact is not found, validation fails, or email is already taken.
   */
  public function updateContact(contact : Contact) : Contact

  /**
   * Deletes a contact by its unique UUID.
   * 
   * @param id The unique identifier of the contact.
   * @throws IllegalArgumentException if the contact is not found.
   */
  public function deleteContact(id : UUID) : void

  /**
   * Searches contacts by name and/or email address.
   * Filters are applied as an AND condition if both are present.
   * - Name: Case-insensitive substring matching on FirstName, LastName, or CompanyName.
   * - Email: Case-insensitive exact match.
   * 
   * @param nameQuery The name substring query (optional).
   * @param emailQuery The email query (optional).
   * @return A list of matching contacts.
   */
  public function searchContacts(nameQuery : String, emailQuery : String) : List<Contact>
}
