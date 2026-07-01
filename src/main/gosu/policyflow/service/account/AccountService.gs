package policyflow.service.account

uses policyflow.domain.account.Account
uses java.util.List

public interface AccountService {
  public function createAccount(account : Account) : Account
  public function getAccount(accountNumber : String) : Account
  public function getAllAccounts() : List<Account>
  public function activateAccount(accountNumber : String) : void
  public function suspendAccount(accountNumber : String) : void
  public function closeAccount(accountNumber : String) : void
}
