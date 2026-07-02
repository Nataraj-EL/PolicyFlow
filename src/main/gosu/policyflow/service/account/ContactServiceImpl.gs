package policyflow.service.account

uses policyflow.domain.account.Contact
uses policyflow.domain.account.ContactType
uses policyflow.repository.account.ContactRepository
uses policyflow.validation.ContactValidator
uses policyflow.validation.ValidationException
uses java.util.ArrayList
uses java.util.List
uses java.util.UUID

/**
 * Service implementation for managing customer Contact lifecycle workflows.
 */
public class ContactServiceImpl implements ContactService {
  private var _repository : ContactRepository

  /**
   * Constructs the service with its repository dependency.
   * 
   * @param repository Data access repository for contacts.
   */
  public construct(repository : ContactRepository) {
    if (repository == null) {
      throw new IllegalArgumentException("ContactRepository cannot be null")
    }
    _repository = repository
  }

  override function createContact(contact : Contact) : Contact {
    if (contact == null) {
      throw new IllegalArgumentException("Contact cannot be null")
    }

    // Run business validations
    var valResult = ContactValidator.validate(contact)
    if (!valResult.Success) {
      throw new ValidationException(valResult.Errors)
    }

    // Duplicate email check
    var email = contact.EmailAddress
    if (email != null && !email.trim().isEmpty()) {
      var duplicate = findDuplicateEmail(email, null)
      if (duplicate) {
        throw new IllegalArgumentException("Email address is already in use: " + email)
      }
    }

    return _repository.save(contact)
  }

  override function getContact(id : UUID) : Contact {
    if (id == null) {
      throw new IllegalArgumentException("Contact ID cannot be null")
    }
    return _repository.findById(id)
  }

  override function getAllContacts() : List<Contact> {
    return _repository.findAll()
  }

  override function updateContact(contact : Contact) : Contact {
    if (contact == null) {
      throw new IllegalArgumentException("Contact cannot be null")
    }
    if (contact.ID == null) {
      throw new IllegalArgumentException("Contact ID cannot be null")
    }

    // Verify contact exists
    var existing = _repository.findById(contact.ID)
    if (existing == null) {
      throw new IllegalArgumentException("Contact not found with ID: " + contact.ID)
    }

    // Run business validations
    var valResult = ContactValidator.validate(contact)
    if (!valResult.Success) {
      throw new ValidationException(valResult.Errors)
    }

    // Duplicate email check (excluding this contact)
    var email = contact.EmailAddress
    if (email != null && !email.trim().isEmpty()) {
      var duplicate = findDuplicateEmail(email, contact.ID)
      if (duplicate) {
        throw new IllegalArgumentException("Email address is already in use: " + email)
      }
    }

    return _repository.save(contact)
  }

  override function deleteContact(id : UUID) {
    if (id == null) {
      throw new IllegalArgumentException("Contact ID cannot be null")
    }

    // Verify contact exists
    var existing = _repository.findById(id)
    if (existing == null) {
      throw new IllegalArgumentException("Contact not found with ID: " + id)
    }

    _repository.delete(id)
  }

  override function searchContacts(nameQuery : String, emailQuery : String) : List<Contact> {
    var results = _repository.findAll()

    var nameClean = (nameQuery != null) ? nameQuery.trim().toLowerCase() : ""
    var emailClean = (emailQuery != null) ? emailQuery.trim().toLowerCase() : ""

    if (!nameClean.isEmpty()) {
      var temp = new ArrayList<Contact>()
      for (c in results) {
        var match = false
        if (c.ContactType == ContactType.PERSON) {
          var first = c.FirstName ?: ""
          var last = c.LastName ?: ""
          if (first.toLowerCase().contains(nameClean) || last.toLowerCase().contains(nameClean)) {
            match = true
          }
        } else if (c.ContactType == ContactType.COMPANY) {
          var comp = c.CompanyName ?: ""
          if (comp.toLowerCase().contains(nameClean)) {
            match = true
          }
        }
        if (match) {
          temp.add(c)
        }
      }
      results = temp
    }

    if (!emailClean.isEmpty()) {
      var temp = new ArrayList<Contact>()
      for (c in results) {
        var email = c.EmailAddress ?: ""
        if (email.toLowerCase().equals(emailClean)) {
          temp.add(c)
        }
      }
      results = temp
    }

    return results
  }

  /**
   * Helper function to detect duplicate email usage.
   * 
   * @param email Email to search.
   * @param excludeId ID to exclude from match (for updates).
   * @return true if duplicate email is found, false otherwise.
   */
  private function findDuplicateEmail(email : String, excludeId : UUID) : boolean {
    var c = _repository.findByEmail(email)
    return c != null && (excludeId == null || !c.ID.equals(excludeId))
  }
}
