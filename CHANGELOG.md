# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-07-04

### Added
- React Single-Page Application: Developed a clean, responsive web interface under the `frontend/` subdirectory utilizing React 18, Vite, and TypeScript.
- Server State Management: Integrated TanStack Query (`@tanstack/react-query`) for unified loading states, error bindings, and automatic cache invalidations.
- Recharts Visualizations: Embedded theme-compliant Recharts distribution statistics to visually display policy classifications and claims statuses.
- Full Customer and Risk CRUD: Supported creation, edits, details, and deletions for contacts and vehicles with immediate toast notifications.
- Policy Life Cycle Endorsements: Implemented endorsement adjustments, pro-rata cancellations, renewals, and reinstatements with visual audit logs.
- Interactive Premium Calculator: Configured a simulator calculating auto premium quotes.
- Extensible Cross-Entity Search: Enabled global case-insensitive search queries with criteria-based filters.
- Styling Token Integration: Deployed CSS variables matching the required brand identity colors on all cards, buttons, modals, input elements, and chart plots.

## [1.0.0] - 2026-07-04

### Added
- REST API Layer: Exposed core repos and services as Spring Boot REST controllers (`/api/contacts`, `/api/vehicles`, `/api/policies`, `/api/claims`, `/api/premium`, `/api/reporting`, `/api/search`).
- Managed Lifecycle: Wired all Gosu services and repos directly as Spring Beans via `ServiceConfig.java`, avoiding reliance on static singletons.
- Global Error Handling: Created `GlobalExceptionHandler` converting business exceptions and validation checks to standard HTTP codes.
- API Documentation: Configured Springdoc OpenAPI for interactive browser API exploration.
- Integration Testing: Added a MockMvc test suite `RestApiIntegrationTest` covering the complete workflow, including creation, update, renewal, cancel, search, and portfolio aggregations.
- Build Architecture: Configured separate maven compiler executions for Gosu and Java sources to compile Gosu bytecode first and prevent mixed-language stub generation errors.

## [0.9.0] - 2026-07-02

### Added
- Time Virtualization: Introduced `ClockProvider` to centralize and mock `LocalDate` and `LocalDateTime` accesses for deterministic test suites.
- Common Exception Hierarchy: Introduced unchecked base exception `PolicyFlowException` (extending `RuntimeException`), along with `EntityNotFoundException` and `BusinessRuleException` subclasses. Refactored `ValidationException` to extend `PolicyFlowException`. Created `ExceptionFormatter` to serialize clean error summaries.
- Config/Constants Management: Introduced `PolicyFlowConfig` central config, refactoring rating rules (`BasePremiumRule`, `StateTaxRule`) to load values from config.
- Logging: Created `StructuredLogger` logging key-value context objects into formatted JSON outputs.
- Dependency Bootstrap Container: Created `AppContainer` DI registry compiling singletons of all repos and services.
- Minimal Input Sanitization: Created `SanitizationUtil` supplying trimmed, lowercased emails, and spacing normalizations.
- Performance Tuning: Implemented O(1) concurrent secondary lookups in repositories.

## [0.8.0] - 2026-07-02

### Added
- Domain Layer: Introduced the `PortfolioSummary` statistics model containing dynamic calculation aggregations, status/type count maps, and a generation timestamp. Created extensible parameter objects: `ContactSearchCriteria`, `PolicySearchCriteria`, and `ClaimSearchCriteria`.
- Service Layer: Added `ReportingService` (generating portfolio summary statistics and dynamically querying the pricing engine to calculate active premium sum) and `SearchService` (executing case-insensitive, trimmed, and null-safe cross-entity lookups in-memory).
- Test Suite: Implemented `ReportingAndSearchTest` verifying counts, active premiums, and cross-entity joins.

## [0.7.0] - 2026-07-02

### Added
- Domain Layer: Introduced `Claim` aggregate entity, `ClaimStatus` enum, `ClaimType` enum, `ClaimTransactionType` enum, and the `ClaimHistoryEntry` audit trail model.
- Repository Layer: Added `ClaimRepository`, `ClaimHistoryRepository` and their thread-safe in-memory map implementations.
- Validation Layer: Created `ClaimValidator` to validate claim invariants, verifying dates are not in the future and loss dates occur on or before reported dates.
- Service Layer: Created `ClaimService` and `ClaimServiceImpl` supporting filing, updating, closing, and searching claims. Enforces that claims can only be filed against `IN_FORCE` policies, that loss dates fall within active policy term ranges, that closed claims cannot be updated, and that claim numbers are globally unique.
- Test Suite: Implemented `ClaimServiceTest` unit tests verifying creation, updates, closed protection, uniqueness checks, and history audit records.

## [0.6.0] - 2026-07-01

### Added
- Domain Layer: Added the `PolicyTransactionType` enum and the `PolicyHistoryEntry` audit trail model. Modified `Policy` to support a `PreviousPolicyId` linkage.
- Repository Layer: Added `PolicyHistoryRepository` and `InMemoryPolicyHistoryRepository` interfaces and implementations.
- Service Layer: Updated `PolicyService` and `PolicyServiceImpl` with methods for policy renewals (generating new policy numbers and linking back via `PreviousPolicyId`), expirations, reinstatements (retaining cancellation date and reason fields), endorsements, and transaction history retrieval.
- Test Suite: Updated `PolicyServiceTest` with cases verifying renewals, expirations, reinstatements, endorsements, and transition audit trail tracking.

## [0.5.0] - 2026-07-01

### Added
- Domain Layer: Introduced `PremiumBreakdown` details utilizing `java.math.BigDecimal` exclusively for monetary precisions. Added the `RatingFactor` enum.
- Rating Engine: Implemented strategy framework (`RatingRule`) and individual rule strategies (`BasePremiumRule`, `VehicleTypeRule`, `VehicleAgeRule`, `FuelTypeRule`, `ContactTypeRule`, `StateTaxRule`), with configurable values. Added `PremiumCalculator` to execute the rating rule chain.
- Service Layer: Added `PremiumCalculationService` and `PremiumCalculationServiceImpl` to execute premium calculations independently from policies.
- Test Suite: Implemented `PremiumCalculationServiceTest` verifying standard and custom rating rules, and BigDecimal assertions.

## [0.4.0] - 2026-07-01

### Added
- Domain Layer: Implemented `Policy` contract aggregate using `java.time.LocalDate` for dates. Added `PolicyType` and `PolicyStatus` enums. Auto-generated read-only `PolicyNumber` and UUID `ID` properties at construction.
- Repository Layer: Added `PolicyRepository` and `InMemoryPolicyRepository` supporting operations like finding by vehicle ID and policy number.
- Validation Layer: Created `PolicyValidator` to validate date limits (expiration after effective), required parameters, and cancellation properties (which are mandatory only for cancelled policies).
- Service Layer: Created `PolicyService` and `PolicyServiceImpl` supporting policy CRUD, searches, cancellations, aggregate existence validations (against contacts and vehicles), and vehicle active policy limits.
- Test Suite: Implemented `PolicyServiceTest` unit tests verifying CRUD, cancellations, validation edge cases, and uniqueness constraints.

## [0.3.0] - 2026-07-01

### Added
- Domain Layer: Implemented `Vehicle` risk entity with a read-only `java.util.UUID` ID, `VIN`, `Make`, `Model`, `ManufactureYear`, and other fields. Added body style (`VehicleType`) and power engine (`FuelType`) enums, with complete KDoc comments.
- Repository Layer: Added `VehicleRepository` and its map-backed implementation `InMemoryVehicleRepository` for CRUD operations.
- Validation Layer: Created `VehicleValidator` to enforce a 17-character alphanumeric VIN, Make/Model presence, and valid year ranges.
- Service Layer: Created `VehicleService` and `VehicleServiceImpl` providing CRUD operations, duplicate checking (for VIN and License Plates), and search (by Make, Model, and VehicleType).
- Test Suite: Implemented `VehicleServiceTest` unit tests to assert CRUD, unique constraint, search, and validation behaviors.

## [0.2.0] - 2026-07-01

### Added
- Domain Layer: Extended `Contact` to possess an immutable `java.util.UUID` identifier. Added Javadoc/KDoc comments to all public models.
- Repository Layer: Introduced `ContactRepository` and its concurrent map implementation `InMemoryContactRepository` for CRUD and retrieval operations.
- Validation Layer: Decoupled contact-specific invariants by introducing a dedicated `ContactValidator` class, refactoring `AccountValidator` to delegate to it.
- Service Layer: Created `ContactService` and `ContactServiceImpl` to provide Contact (Customer) CRUD operations, search metrics (by exact UUID, case-insensitive Name substring, and exact case-insensitive Email), and duplicate email detection.
- Test Suite: Implemented `ContactServiceTest` unit tests to achieve >80% code coverage.

## [0.1.0] - 2026-07-01

### Added
- Maven build configuration (`pom.xml`) with the Gosu Maven compiler plugin.
- Git repository setup and `.gitignore` configuration.
- Domain entities: `Account`, `Contact`, `Address`, `AccountStatus`, and `ContactType` written in Gosu.
- Repository layer: `AccountRepository` interface and its mock implementation `InMemoryAccountRepository`.
- Validation layer: `ValidationResult` and `AccountValidator` checking required fields, email formatting, and billing data.
- Service layer: `AccountService` and `AccountServiceImpl` supporting creation, retrieval, activation, suspension, and closing of accounts with validation constraints.
- Test suite: `AccountServiceTest` verifying standard business workflows and validation edge cases.
