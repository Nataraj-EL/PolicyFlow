package policyflow.service.account

uses policyflow.domain.account.Account
uses policyflow.domain.account.AccountStatus
uses policyflow.repository.account.AccountRepository
uses policyflow.validation.AccountValidator
uses policyflow.validation.ValidationException
uses java.util.List

/**
 * Service implementation for managing customer Account lifecycle workflows.
 */
public class AccountServiceImpl implements AccountService {
  private var _repository : AccountRepository

  /**
   * Constructs the service with its repository dependency.
   * 
   * @param repository Data access repository for accounts.
   */
  public construct(repository : AccountRepository) {
    if (repository == null) {
      throw new IllegalArgumentException("AccountRepository cannot be null")
    }
    _repository = repository
  }

  override function createAccount(account : Account) : Account {
    if (account == null) {
      throw new IllegalArgumentException("Account cannot be null")
    }
    if (account.AccountNumber == null || account.AccountNumber.trim().isEmpty()) {
      throw new IllegalArgumentException("Account Number is required")
    }

    // Uniqueness check
    var existing = _repository.findByAccountNumber(account.AccountNumber)
    if (existing != null) {
      throw new IllegalArgumentException("Account number already exists: " + account.AccountNumber)
    }

    account.Status = AccountStatus.DRAFT
    return _repository.save(account)
  }

  override function getAccount(accountNumber : String) : Account {
    if (accountNumber == null || accountNumber.trim().isEmpty()) {
      throw new IllegalArgumentException("Account Number is required")
    }
    return _repository.findByAccountNumber(accountNumber)
  }

  override function getAllAccounts() : List<Account> {
    return _repository.findAll()
  }

  override function activateAccount(accountNumber : String) {
    var account = getAccount(accountNumber)
    if (account == null) {
      throw new IllegalArgumentException("Account not found: " + accountNumber)
    }

    if (account.Status == AccountStatus.ACTIVE) {
      return // Already active
    }
    if (account.Status == AccountStatus.CLOSED) {
      throw new IllegalStateException("Cannot activate a closed account: " + accountNumber)
    }

    // Run full validator
    var valResult = AccountValidator.validate(account)
    if (!valResult.Success) {
      throw new ValidationException(valResult.Errors)
    }

    account.Status = AccountStatus.ACTIVE
    _repository.save(account)
  }

  override function suspendAccount(accountNumber : String) {
    var account = getAccount(accountNumber)
    if (account == null) {
      throw new IllegalArgumentException("Account not found: " + accountNumber)
    }

    if (account.Status == AccountStatus.SUSPENDED) {
      return
    }

    if (account.Status != AccountStatus.ACTIVE) {
      throw new IllegalStateException("Only active accounts can be suspended. Current status: " + account.Status)
    }

    account.Status = AccountStatus.SUSPENDED
    _repository.save(account)
  }

  override function closeAccount(accountNumber : String) {
    var account = getAccount(accountNumber)
    if (account == null) {
      throw new IllegalArgumentException("Account not found: " + accountNumber)
    }

    if (account.Status == AccountStatus.CLOSED) {
      return
    }

    account.Status = AccountStatus.CLOSED
    _repository.save(account)
  }
}
