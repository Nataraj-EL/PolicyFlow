package policyflow.service.account

uses org.junit.Assert
uses org.junit.Before
uses org.junit.Test
uses policyflow.domain.account.Account
uses policyflow.domain.account.AccountStatus
uses policyflow.domain.account.Address
uses policyflow.domain.account.Contact
uses policyflow.domain.account.ContactType
uses policyflow.repository.account.InMemoryAccountRepository
uses policyflow.validation.ValidationException

public class AccountServiceTest {
  private var _repository : InMemoryAccountRepository
  private var _service : AccountServiceImpl

  @Before
  public function setUp() {
    _repository = new InMemoryAccountRepository()
    _service = new AccountServiceImpl(_repository)
  }

  @Test
  public function testCreateAccountSuccessful() {
    var account = new Account("ACT-1001")
    var saved = _service.createAccount(account)
    
    Assert.assertNotNull(saved)
    Assert.assertEquals("ACT-1001", saved.AccountNumber)
    Assert.assertEquals(AccountStatus.DRAFT, saved.Status)
    
    var retrieved = _service.getAccount("ACT-1001")
    Assert.assertEquals(saved, retrieved)
  }

  @Test
  public function testCreateDuplicateAccountNumberThrowsException() {
    var account1 = new Account("ACT-1001")
    _service.createAccount(account1)

    var account2 = new Account("ACT-1001")
    try {
      _service.createAccount(account2)
      Assert.fail("Expected IllegalArgumentException to be thrown")
    } catch (e : IllegalArgumentException) {
      // Expected
    }
  }

  @Test
  public function testActivateAccountSuccessful() {
    var account = new Account("ACT-1002")
    
    // Set required billing address
    var billingAddr = new Address("123 PwC Way", null, "New York", "NY", "10001", "USA")
    account.BillingAddress = billingAddr
    
    // Set valid contact
    var contact = new Contact(ContactType.PERSON)
    contact.FirstName = "Nataraj"
    contact.LastName = "EL"
    contact.EmailAddress = "nataraj@pwc.com"
    
    var contactAddr = new Address("456 Partner Rd", null, "San Jose", "CA", "95110", "USA")
    contact.PrimaryAddress = contactAddr
    
    // Set as Primary Contact (which auto-adds it to account contacts list)
    account.PrimaryContact = contact

    _service.createAccount(account)
    _service.activateAccount("ACT-1002")

    var activeAccount = _service.getAccount("ACT-1002")
    Assert.assertEquals(AccountStatus.ACTIVE, activeAccount.Status)
  }

  @Test
  public function testActivateAccountWithValidationFailureThrowsException() {
    var account = new Account("ACT-1003")
    _service.createAccount(account) // Missing address and contacts, status is DRAFT

    try {
      _service.activateAccount("ACT-1003")
      Assert.fail("Expected ValidationException to be thrown")
    } catch (e : ValidationException) {
      Assert.assertTrue(e.Errors.size() > 0)
      Assert.assertTrue(e.Errors.contains("Account billing address is required."))
      Assert.assertTrue(e.Errors.contains("Account must have at least one contact."))
      Assert.assertTrue(e.Errors.contains("Account must have a primary contact."))
    }
  }

  @Test
  public function testSuspendAccountSuccessful() {
    // Setup and activate account
    var account = new Account("ACT-1004")
    account.BillingAddress = new Address("123 PwC Way", null, "New York", "NY", "10001", "USA")
    
    var contact = new Contact(ContactType.PERSON)
    contact.FirstName = "Nataraj"
    contact.LastName = "EL"
    contact.EmailAddress = "nataraj@pwc.com"
    contact.PrimaryAddress = new Address("456 Partner Rd", null, "San Jose", "CA", "95110", "USA")
    account.PrimaryContact = contact

    _service.createAccount(account)
    _service.activateAccount("ACT-1004")
    
    // Suspend
    _service.suspendAccount("ACT-1004")
    
    var suspendedAccount = _service.getAccount("ACT-1004")
    Assert.assertEquals(AccountStatus.SUSPENDED, suspendedAccount.Status)
  }

  @Test
  public function testSuspendDraftAccountThrowsException() {
    var account = new Account("ACT-1005")
    _service.createAccount(account) // In DRAFT
    
    try {
      _service.suspendAccount("ACT-1005")
      Assert.fail("Expected IllegalStateException to be thrown")
    } catch (e : IllegalStateException) {
      // Expected
    }
  }

  @Test
  public function testCloseAccountFromAnyState() {
    var account = new Account("ACT-1006")
    _service.createAccount(account) // DRAFT
    
    _service.closeAccount("ACT-1006")
    var closedAccount = _service.getAccount("ACT-1006")
    Assert.assertEquals(AccountStatus.CLOSED, closedAccount.Status)
  }

  @Test
  public function testActivateClosedAccountThrowsException() {
    var account = new Account("ACT-1007")
    _service.createAccount(account)
    _service.closeAccount("ACT-1007")
    
    try {
      _service.activateAccount("ACT-1007")
      Assert.fail("Expected IllegalStateException to be thrown")
    } catch (e : IllegalStateException) {
      // Expected
    }
  }
}
