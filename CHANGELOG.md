# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
