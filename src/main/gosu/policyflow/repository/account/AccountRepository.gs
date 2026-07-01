package policyflow.repository.account

uses policyflow.domain.account.Account
uses java.util.List

public interface AccountRepository {
  public function save(account : Account) : Account
  public function findByAccountNumber(accountNumber : String) : Account
  public function findAll() : List<Account>
  public function delete(accountNumber : String) : boolean
  public function clear() : void
}
