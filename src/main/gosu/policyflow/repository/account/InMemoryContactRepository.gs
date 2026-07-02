package policyflow.repository.account

uses policyflow.domain.account.Contact
uses java.util.concurrent.ConcurrentHashMap
uses java.util.ArrayList
uses java.util.List
uses java.util.UUID

/**
 * Concurrent map-backed implementation of {@link ContactRepository} for in-memory persistence.
 * Employs a secondary index for fast O(1) email lookups.
 */
public class InMemoryContactRepository implements ContactRepository {
  private var _db = new ConcurrentHashMap<UUID, Contact>()
  private var _emailIndex = new ConcurrentHashMap<String, Contact>()

  override function save(contact : Contact) : Contact {
    if (contact == null) {
      throw new IllegalArgumentException("Contact cannot be null")
    }
    if (contact.ID == null) {
      throw new IllegalArgumentException("Contact ID cannot be null")
    }

    // Clean old index if updating
    var existing = _db.get(contact.ID)
    if (existing != null && existing.EmailAddress != null) {
      _emailIndex.remove(existing.EmailAddress.trim().toLowerCase())
    }

    _db.put(contact.ID, contact)

    if (contact.EmailAddress != null && !contact.EmailAddress.trim().isEmpty()) {
      _emailIndex.put(contact.EmailAddress.trim().toLowerCase(), contact)
    }

    return contact
  }

  override function findById(id : UUID) : Contact {
    if (id == null) {
      return null
    }
    return _db.get(id)
  }

  override function findByEmail(email : String) : Contact {
    if (email == null || email.trim().isEmpty()) {
      return null
    }
    return _emailIndex.get(email.trim().toLowerCase())
  }

  override function findAll() : List<Contact> {
    return new ArrayList<Contact>(_db.values())
  }

  override function delete(id : UUID) : boolean {
    if (id == null) {
      return false
    }
    var existing = _db.remove(id)
    if (existing != null) {
      if (existing.EmailAddress != null) {
        _emailIndex.remove(existing.EmailAddress.trim().toLowerCase())
      }
      return true
    }
    return false
  }

  override function clear() {
    _db.clear()
    _emailIndex.clear()
  }
}
