package policyflow.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import policyflow.repository.account.AccountRepository;
import policyflow.repository.account.InMemoryAccountRepository;
import policyflow.repository.account.ContactRepository;
import policyflow.repository.account.InMemoryContactRepository;
import policyflow.repository.vehicle.VehicleRepository;
import policyflow.repository.vehicle.InMemoryVehicleRepository;
import policyflow.repository.policy.PolicyRepository;
import policyflow.repository.policy.InMemoryPolicyRepository;
import policyflow.repository.policy.PolicyHistoryRepository;
import policyflow.repository.policy.InMemoryPolicyHistoryRepository;
import policyflow.repository.claim.ClaimRepository;
import policyflow.repository.claim.InMemoryClaimRepository;
import policyflow.repository.claim.ClaimHistoryRepository;
import policyflow.repository.claim.InMemoryClaimHistoryRepository;

import policyflow.service.account.AccountService;
import policyflow.service.account.AccountServiceImpl;
import policyflow.service.account.ContactService;
import policyflow.service.account.ContactServiceImpl;
import policyflow.service.vehicle.VehicleService;
import policyflow.service.vehicle.VehicleServiceImpl;
import policyflow.service.policy.PolicyService;
import policyflow.service.policy.PolicyServiceImpl;
import policyflow.service.rating.PremiumCalculationService;
import policyflow.service.rating.PremiumCalculationServiceImpl;
import policyflow.service.claim.ClaimService;
import policyflow.service.claim.ClaimServiceImpl;
import policyflow.service.reporting.ReportingService;
import policyflow.service.reporting.ReportingServiceImpl;
import policyflow.service.search.SearchService;
import policyflow.service.search.SearchServiceImpl;

import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Spring configuration class defining beans for repositories and services.
 */
@Configuration
public class ServiceConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("*")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD")
                        .allowedHeaders("*");
            }
        };
    }

    // --- Repositories ---

    @Bean
    public AccountRepository accountRepository() {
        return new InMemoryAccountRepository();
    }

    @Bean
    public ContactRepository contactRepository() {
        return new InMemoryContactRepository();
    }

    @Bean
    public VehicleRepository vehicleRepository() {
        return new InMemoryVehicleRepository();
    }

    @Bean
    public PolicyRepository policyRepository() {
        return new InMemoryPolicyRepository();
    }

    @Bean
    public PolicyHistoryRepository policyHistoryRepository() {
        return new InMemoryPolicyHistoryRepository();
    }

    @Bean
    public ClaimRepository claimRepository() {
        return new InMemoryClaimRepository();
    }

    @Bean
    public ClaimHistoryRepository claimHistoryRepository() {
        return new InMemoryClaimHistoryRepository();
    }

    // --- Services ---

    @Bean
    public AccountService accountService(AccountRepository accountRepository) {
        return new AccountServiceImpl(accountRepository);
    }

    @Bean
    public ContactService contactService(ContactRepository contactRepository) {
        return new ContactServiceImpl(contactRepository);
    }

    @Bean
    public VehicleService vehicleService(VehicleRepository vehicleRepository) {
        return new VehicleServiceImpl(vehicleRepository);
    }

    @Bean
    public PolicyService policyService(PolicyRepository policyRepository,
                                       ContactRepository contactRepository,
                                       VehicleRepository vehicleRepository) {
        return new PolicyServiceImpl(policyRepository, contactRepository, vehicleRepository);
    }

    @Bean
    public PremiumCalculationService premiumCalculationService() {
        return new PremiumCalculationServiceImpl();
    }

    @Bean
    public ClaimService claimService(ClaimRepository claimRepository,
                                     ClaimHistoryRepository claimHistoryRepository,
                                     PolicyRepository policyRepository) {
        return new ClaimServiceImpl(claimRepository, claimHistoryRepository, policyRepository);
    }

    @Bean
    public ReportingService reportingService(PolicyRepository policyRepository,
                                             ClaimRepository claimRepository,
                                             VehicleRepository vehicleRepository,
                                             ContactRepository contactRepository,
                                             PremiumCalculationService premiumCalculationService) {
        return new ReportingServiceImpl(policyRepository, claimRepository, vehicleRepository, contactRepository, premiumCalculationService);
    }

    @Bean
    public SearchService searchService(ContactRepository contactRepository,
                                       PolicyRepository policyRepository,
                                       VehicleRepository vehicleRepository,
                                       ClaimRepository claimRepository) {
        return new SearchServiceImpl(contactRepository, policyRepository, vehicleRepository, claimRepository);
    }
}
