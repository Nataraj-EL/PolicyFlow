package policyflow.repository.account

uses policyflow.domain.account.Contact
uses java.util.concurrent.ConcurrentHashMap
uses java.util.ArrayList
uses java.util.List
uses java.util.UUID

/**
 * Concurrent map-backed implementation of {@link ContactRepository} for in-memory persistence.
 */
public class InMemoryContactRepository implements ContactRepository {
  private var _db = new ConcurrentHashMap<UUID, Contact>()

  override function save(contact : Contact) : Contact {
    if (contact == null) {
      throw new IllegalArgumentException("Contact cannot be null")
    }
    if (contact.ID == null) {
      throw new IllegalArgumentException("Contact ID cannot be null")
    }
    _db.put(contact.ID, contact)
    return contact
  }

  override function findById(id : UUID) : Contact {
    if (id == null) {
      return null
    }
    return _db.get(id)
  }

  override function findAll() : List<Contact> {
    return new ArrayList<Contact>(_db.values())
  }

  override function delete(id : UUID) : boolean {
    if (id == null) {
      return false
    }
    return _db.remove(id) != null
  }

  override function clear() {
    _db.clear()
  }
}
