# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-07-01

### Added
- Maven build configuration (`pom.xml`) with the Gosu Maven compiler plugin.
- Git repository setup and `.gitignore` configuration.
- Domain entities: `Account`, `Contact`, `Address`, `AccountStatus`, and `ContactType` written in Gosu.
- Repository layer: `AccountRepository` interface and its mock implementation `InMemoryAccountRepository`.
- Validation layer: `ValidationResult` and `AccountValidator` checking required fields, email formatting, and billing data.
- Service layer: `AccountService` and `AccountServiceImpl` supporting creation, retrieval, activation, suspension, and closing of accounts with validation constraints.
- Test suite: `AccountServiceTest` verifying standard business workflows and validation edge cases.
