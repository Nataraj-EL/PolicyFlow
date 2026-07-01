package policyflow.repository.account

uses policyflow.domain.account.Account
uses java.util.concurrent.ConcurrentHashMap
uses java.util.ArrayList
uses java.util.List

public class InMemoryAccountRepository implements AccountRepository {
  private var _db = new ConcurrentHashMap<String, Account>()

  override function save(account : Account) : Account {
    if (account == null) {
      throw new IllegalArgumentException("Account cannot be null")
    }
    if (account.AccountNumber == null || account.AccountNumber.trim().isEmpty()) {
      throw new IllegalArgumentException("Account Number cannot be empty")
    }
    _db.put(account.AccountNumber, account)
    return account
  }

  override function findByAccountNumber(accountNumber : String) : Account {
    if (accountNumber == null) {
      return null
    }
    return _db.get(accountNumber)
  }

  override function findAll() : List<Account> {
    return new ArrayList<Account>(_db.values())
  }

  override function delete(accountNumber : String) : boolean {
    if (accountNumber == null) {
      return false
    }
    return _db.remove(accountNumber) != null
  }

  override function clear() {
    _db.clear()
  }
}
