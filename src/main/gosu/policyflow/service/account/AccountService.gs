package policyflow.service.account

uses policyflow.domain.account.Account
uses java.util.List

/**
 * Service interface for managing Account lifecycle and workflows.
 */
public interface AccountService {
  /**
   * Validates and creates a new Account in the persistence store.
   * Checks for unique account numbers.
   * 
   * @param account The account object to create.
   * @return The created account instance.
   * @throws IllegalArgumentException if the account number is empty or already exists.
   */
  public function createAccount(account : Account) : Account

  /**
   * Retrieves an Account by its unique account number.
   * 
   * @param accountNumber Unique account number.
   * @return The account if found, null otherwise.
   */
  public function getAccount(accountNumber : String) : Account

  /**
   * Returns a list of all accounts currently registered.
   * 
   * @return A list of all accounts.
   */
  public function getAllAccounts() : List<Account>

  /**
   * Validates and activates an existing Account.
   * Enforces transition constraints (closed accounts cannot be activated).
   * 
   * @param accountNumber Unique account number.
   * @throws IllegalArgumentException if the account is not found.
   * @throws IllegalStateException if the account is closed.
   * @throws policyflow.validation.ValidationException if the account fails validation checks.
   */
  public function activateAccount(accountNumber : String) : void

  /**
   * Suspends an active Account.
   * Only active accounts can be suspended.
   * 
   * @param accountNumber Unique account number.
   * @throws IllegalArgumentException if the account is not found.
   * @throws IllegalStateException if the account status is not ACTIVE.
   */
  public function suspendAccount(accountNumber : String) : void

  /**
   * Closes an existing Account.
   * Closed accounts are terminal and cannot be reactivated.
   * 
   * @param accountNumber Unique account number.
   * @throws IllegalArgumentException if the account is not found.
   */
  public function closeAccount(accountNumber : String) : void
}
