package policyflow.common.bootstrap

uses policyflow.repository.account.AccountRepository
uses policyflow.repository.account.InMemoryAccountRepository
uses policyflow.repository.account.ContactRepository
uses policyflow.repository.account.InMemoryContactRepository
uses policyflow.repository.vehicle.VehicleRepository
uses policyflow.repository.vehicle.InMemoryVehicleRepository
uses policyflow.repository.policy.PolicyRepository
uses policyflow.repository.policy.InMemoryPolicyRepository
uses policyflow.repository.policy.PolicyHistoryRepository
uses policyflow.repository.policy.InMemoryPolicyHistoryRepository
uses policyflow.repository.claim.ClaimRepository
uses policyflow.repository.claim.InMemoryClaimRepository
uses policyflow.repository.claim.ClaimHistoryRepository
uses policyflow.repository.claim.InMemoryClaimHistoryRepository
uses policyflow.service.account.AccountService
uses policyflow.service.account.AccountServiceImpl
uses policyflow.service.account.ContactService
uses policyflow.service.account.ContactServiceImpl
uses policyflow.service.vehicle.VehicleService
uses policyflow.service.vehicle.VehicleServiceImpl
uses policyflow.service.policy.PolicyService
uses policyflow.service.policy.PolicyServiceImpl
uses policyflow.service.rating.PremiumCalculationService
uses policyflow.service.rating.PremiumCalculationServiceImpl
uses policyflow.service.claim.ClaimService
uses policyflow.service.claim.ClaimServiceImpl
uses policyflow.service.reporting.ReportingService
uses policyflow.service.reporting.ReportingServiceImpl
uses policyflow.service.search.SearchService
uses policyflow.service.search.SearchServiceImpl

/**
 * Bootstrap container providing simple dependency injection and singleton lifecycle management.
 */
public class AppContainer {
  private static var _instance : AppContainer = new AppContainer()

  private var _accountRepo : AccountRepository
  private var _contactRepo : ContactRepository
  private var _vehicleRepo : VehicleRepository
  private var _policyRepo : PolicyRepository
  private var _policyHistoryRepo : PolicyHistoryRepository
  private var _claimRepo : ClaimRepository
  private var _claimHistoryRepo : ClaimHistoryRepository

  private var _accountService : AccountService
  private var _contactService : ContactService
  private var _vehicleService : VehicleService
  private var _policyService : PolicyService
  private var _premiumService : PremiumCalculationService
  private var _claimService : ClaimService
  private var _reportingService : ReportingService
  private var _searchService : SearchService

  private construct() {
    initContainer()
  }

  /**
   * Retrieves the singleton AppContainer instance.
   * 
   * @return The AppContainer.
   */
  public static function get() : AppContainer {
    return _instance
  }

  /**
   * Resets the entire container state, re-instantiating all singletons (useful for test isolation).
   */
  public static function reset() {
    _instance = new AppContainer()
  }

  private function initContainer() {
    // 1. Initialize Repositories
    _accountRepo = new InMemoryAccountRepository()
    _contactRepo = new InMemoryContactRepository()
    _vehicleRepo = new InMemoryVehicleRepository()
    _policyRepo = new InMemoryPolicyRepository()
    _policyHistoryRepo = new InMemoryPolicyHistoryRepository()
    _claimRepo = new InMemoryClaimRepository()
    _claimHistoryRepo = new InMemoryClaimHistoryRepository()

    // 2. Initialize Services with dependency wiring
    _accountService = new AccountServiceImpl(_accountRepo)
    _contactService = new ContactServiceImpl(_contactRepo)
    _vehicleService = new VehicleServiceImpl(_vehicleRepo)
    _policyService = new PolicyServiceImpl(_policyRepo, _contactRepo, _vehicleRepo)
    _premiumService = new PremiumCalculationServiceImpl()
    _claimService = new ClaimServiceImpl(_claimRepo, _claimHistoryRepo, _policyRepo)
    _reportingService = new ReportingServiceImpl(_policyRepo, _claimRepo, _vehicleRepo, _contactRepo, _premiumService)
    _searchService = new SearchServiceImpl(_contactRepo, _policyRepo, _vehicleRepo, _claimRepo)
  }

  // --- Getters ---
  /**
   * Gets the wired AccountRepository.
   * @return AccountRepository instance.
   */
  public property get AccountRepository() : AccountRepository { return _accountRepo }

  /**
   * Gets the wired ContactRepository.
   * @return ContactRepository instance.
   */
  public property get ContactRepository() : ContactRepository { return _contactRepo }

  /**
   * Gets the wired VehicleRepository.
   * @return VehicleRepository instance.
   */
  public property get VehicleRepository() : VehicleRepository { return _vehicleRepo }

  /**
   * Gets the wired PolicyRepository.
   * @return PolicyRepository instance.
   */
  public property get PolicyRepository() : PolicyRepository { return _policyRepo }

  /**
   * Gets the wired PolicyHistoryRepository.
   * @return PolicyHistoryRepository instance.
   */
  public property get PolicyHistoryRepository() : PolicyHistoryRepository { return _policyHistoryRepo }

  /**
   * Gets the wired ClaimRepository.
   * @return ClaimRepository instance.
   */
  public property get ClaimRepository() : ClaimRepository { return _claimRepo }

  /**
   * Gets the wired ClaimHistoryRepository.
   * @return ClaimHistoryRepository instance.
   */
  public property get ClaimHistoryRepository() : ClaimHistoryRepository { return _claimHistoryRepo }

  /**
   * Gets the wired AccountService.
   * @return AccountService instance.
   */
  public property get AccountService() : AccountService { return _accountService }

  /**
   * Gets the wired ContactService.
   * @return ContactService instance.
   */
  public property get ContactService() : ContactService { return _contactService }

  /**
   * Gets the wired VehicleService.
   * @return VehicleService instance.
   */
  public property get VehicleService() : VehicleService { return _vehicleService }

  /**
   * Gets the wired PolicyService.
   * @return PolicyService instance.
   */
  public property get PolicyService() : PolicyService { return _policyService }

  /**
   * Gets the wired PremiumCalculationService.
   * @return PremiumCalculationService instance.
   */
  public property get PremiumCalculationService() : PremiumCalculationService { return _premiumService }

  /**
   * Gets the wired ClaimService.
   * @return ClaimService instance.
   */
  public property get ClaimService() : ClaimService { return _claimService }

  /**
   * Gets the wired ReportingService.
   * @return ReportingService instance.
   */
  public property get ReportingService() : ReportingService { return _reportingService }

  /**
   * Gets the wired SearchService.
   * @return SearchService instance.
   */
  public property get SearchService() : SearchService { return _searchService }
}
