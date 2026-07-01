package policyflow.service.account

uses org.junit.Assert
uses org.junit.Before
uses org.junit.Test
uses policyflow.domain.account.Contact
uses policyflow.domain.account.ContactType
uses policyflow.domain.account.Address
uses policyflow.repository.account.InMemoryContactRepository
uses policyflow.validation.ValidationException
uses java.util.UUID

/**
 * Unit tests for {@link ContactService} and {@link ContactServiceImpl}.
 */
public class ContactServiceTest {
  private var _repository : InMemoryContactRepository
  private var _service : ContactServiceImpl

  @Before
  public function setUp() {
    _repository = new InMemoryContactRepository()
    _service = new ContactServiceImpl(_repository)
  }

  @Test
  public function testCreateContactPersonSuccessful() {
    var contact = new Contact(ContactType.PERSON)
    contact.FirstName = "Nataraj"
    contact.LastName = "EL"
    contact.EmailAddress = "nataraj@pwc.com"
    contact.PrimaryAddress = new Address("123 PwC Way", null, "New York", "NY", "10001", "USA")

    var saved = _service.createContact(contact)
    Assert.assertNotNull(saved)
    Assert.assertNotNull(saved.ID)
    Assert.assertEquals("Nataraj", saved.FirstName)
    Assert.assertEquals("Nataraj EL", saved.DisplayName)

    var retrieved = _service.getContact(saved.ID)
    Assert.assertEquals(saved, retrieved)
  }

  @Test
  public function testCreateContactCompanySuccessful() {
    var contact = new Contact(ContactType.COMPANY)
    contact.CompanyName = "PwC LLP"
    contact.EmailAddress = "info@pwc.com"
    contact.PrimaryAddress = new Address("300 Madison Ave", null, "New York", "NY", "10017", "USA")

    var saved = _service.createContact(contact)
    Assert.assertNotNull(saved)
    Assert.assertEquals("PwC LLP", saved.CompanyName)
    Assert.assertEquals("PwC LLP", saved.DisplayName)
  }

  @Test
  public function testCreateContactValidationFailureThrowsException() {
    var contact = new Contact(ContactType.PERSON)
    // Missing required fields (FirstName, LastName, Address)

    try {
      _service.createContact(contact)
      Assert.fail("Expected ValidationException to be thrown")
    } catch (e : ValidationException) {
      Assert.assertTrue(e.Errors.size() > 0)
      Assert.assertTrue(e.Errors.contains("First name is required for contact: "))
      Assert.assertTrue(e.Errors.contains("Last name is required for contact: "))
      Assert.assertTrue(e.Errors.contains("Primary address is required for contact: "))
    }
  }

  @Test
  public function testCreateDuplicateEmailThrowsException() {
    var contact1 = new Contact(ContactType.PERSON)
    contact1.FirstName = "Nataraj"
    contact1.LastName = "EL"
    contact1.EmailAddress = "duplicate@pwc.com"
    contact1.PrimaryAddress = new Address("123 PwC Way", null, "New York", "NY", "10001", "USA")
    _service.createContact(contact1)

    var contact2 = new Contact(ContactType.PERSON)
    contact2.FirstName = "Another"
    contact2.LastName = "Person"
    contact2.EmailAddress = "duplicate@pwc.com" // Duplicate
    contact2.PrimaryAddress = new Address("123 PwC Way", null, "New York", "NY", "10001", "USA")

    try {
      _service.createContact(contact2)
      Assert.fail("Expected IllegalArgumentException due to duplicate email")
    } catch (e : IllegalArgumentException) {
      Assert.assertTrue(e.Message.contains("Email address is already in use"))
    }
  }

  @Test
  public function testUpdateContactSuccessful() {
    var contact = new Contact(ContactType.PERSON)
    contact.FirstName = "Nataraj"
    contact.LastName = "EL"
    contact.EmailAddress = "nataraj@pwc.com"
    contact.PrimaryAddress = new Address("123 PwC Way", null, "New York", "NY", "10001", "USA")
    var saved = _service.createContact(contact)

    // Update details
    saved.FirstName = "Nataraj Updated"
    var updated = _service.updateContact(saved)
    Assert.assertEquals("Nataraj Updated", updated.FirstName)

    var retrieved = _service.getContact(saved.ID)
    Assert.assertEquals("Nataraj Updated", retrieved.FirstName)
  }

  @Test
  public function testUpdateAllowsSameEmail() {
    var contact = new Contact(ContactType.PERSON)
    contact.FirstName = "Nataraj"
    contact.LastName = "EL"
    contact.EmailAddress = "nataraj@pwc.com"
    contact.PrimaryAddress = new Address("123 PwC Way", null, "New York", "NY", "10001", "USA")
    var saved = _service.createContact(contact)

    // Update details without changing email
    saved.PhoneNumber = "555-0199"
    var updated = _service.updateContact(saved)
    Assert.assertEquals("555-0199", updated.PhoneNumber)
  }

  @Test
  public function testUpdateDuplicateEmailThrowsException() {
    var contact1 = new Contact(ContactType.PERSON)
    contact1.FirstName = "First"
    contact1.LastName = "User"
    contact1.EmailAddress = "first@pwc.com"
    contact1.PrimaryAddress = new Address("123 PwC Way", null, "New York", "NY", "10001", "USA")
    _service.createContact(contact1)

    var contact2 = new Contact(ContactType.PERSON)
    contact2.FirstName = "Second"
    contact2.LastName = "User"
    contact2.EmailAddress = "second@pwc.com"
    contact2.PrimaryAddress = new Address("123 PwC Way", null, "New York", "NY", "10001", "USA")
    var saved2 = _service.createContact(contact2)

    // Update email of contact2 to match contact1
    saved2.EmailAddress = "first@pwc.com"

    try {
      _service.updateContact(saved2)
      Assert.fail("Expected IllegalArgumentException due to duplicate email on update")
    } catch (e : IllegalArgumentException) {
      Assert.assertTrue(e.Message.contains("Email address is already in use"))
    }
  }

  @Test
  public function testDeleteContactSuccessful() {
    var contact = new Contact(ContactType.PERSON)
    contact.FirstName = "Nataraj"
    contact.LastName = "EL"
    contact.PrimaryAddress = new Address("123 PwC Way", null, "New York", "NY", "10001", "USA")
    var saved = _service.createContact(contact)

    Assert.assertNotNull(_service.getContact(saved.ID))

    _service.deleteContact(saved.ID)

    var retrieved = _service.getContact(saved.ID)
    Assert.assertNull(retrieved)
  }

  @Test
  public function testSearchContactsByName() {
    var contact1 = new Contact(ContactType.PERSON)
    contact1.FirstName = "Alice"
    contact1.LastName = "Smith"
    contact1.PrimaryAddress = new Address("123 PwC Way", null, "New York", "NY", "10001", "USA")
    _service.createContact(contact1)

    var contact2 = new Contact(ContactType.PERSON)
    contact2.FirstName = "Bob"
    contact2.LastName = "Smith"
    contact2.PrimaryAddress = new Address("123 PwC Way", null, "New York", "NY", "10001", "USA")
    _service.createContact(contact2)

    var contact3 = new Contact(ContactType.COMPANY)
    contact3.CompanyName = "AliceCorp"
    contact3.PrimaryAddress = new Address("123 PwC Way", null, "New York", "NY", "10001", "USA")
    _service.createContact(contact3)

    // Search case-insensitive substring
    var results = _service.searchContacts("alice", null)
    Assert.assertEquals(2, results.size()) // Alice Smith and AliceCorp

    results = _service.searchContacts("smith", null)
    Assert.assertEquals(2, results.size()) // Alice Smith and Bob Smith
  }

  @Test
  public function testSearchContactsByEmail() {
    var contact1 = new Contact(ContactType.PERSON)
    contact1.FirstName = "Alice"
    contact1.LastName = "Smith"
    contact1.EmailAddress = "alice@pwc.com"
    contact1.PrimaryAddress = new Address("123 PwC Way", null, "New York", "NY", "10001", "USA")
    _service.createContact(contact1)

    var contact2 = new Contact(ContactType.PERSON)
    contact2.FirstName = "Bob"
    contact2.LastName = "Smith"
    contact2.EmailAddress = "bob@pwc.com"
    contact2.PrimaryAddress = new Address("123 PwC Way", null, "New York", "NY", "10001", "USA")
    _service.createContact(contact2)

    var results = _service.searchContacts(null, "ALICE@PWC.COM")
    Assert.assertEquals(1, results.size())
    Assert.assertEquals(contact1.ID, results.get(0).ID)
  }
}
