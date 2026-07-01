# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
