# PolicyFlow

PolicyFlow is a production-quality, educational insurance management system written in **Gosu** (running on JVM). It is designed to demonstrate key Guidewire software engineering concepts, insurance domain knowledge, clean architecture principles, and professional software engineering standards.

## Project Vision & Architecture

PolicyFlow follows **Clean Architecture** and **SOLID** design principles. The codebase is strictly modularized into distinct layers:

```
PolicyFlow/
├── pom.xml                   # Maven build configuration for Gosu
├── README.md                 # Technical overview
├── CHANGELOG.md              # Version and sprint release history
└── src/
    ├── main/gosu/policyflow/
    │   ├── domain/           # Core enterprise domain entities (Account, Contact, Address)
    │   ├── repository/       # Data access interfaces and mock implementations
    │   ├── validation/       # Rich business validation rules and results
    │   └── service/          # Business logic orchestrators for core insurance processes
    └── test/gosu/policyflow/
        └── service/          # Suite of automated tests
```

### Domain Layer
Defines the enterprise models (e.g. `Account`, `Contact`, `Address`) and their associated lifecycles (e.g. `AccountStatus`). Domain classes are independent of external frameworks.

### Repository Layer
Abstracst persistence behind interfaces (`AccountRepository`). We currently use a thread-safe, concurrent in-memory repository (`InMemoryAccountRepository`) for local execution and testing.

### Validation Layer
Enforces domain invariants and business rules. The validator (`AccountValidator`) ensures data integrity (e.g. required physical address fields, email format validations) and reports errors and warnings via a structured `ValidationResult`.

### Service Layer
Executes business transactions and controls state transitions (`AccountServiceImpl`). Services encapsulate workflows such as account creation, validation, activation, suspension, and closure.

---

## Technical Stack

* **Language**: Gosu 1.18.7 (runs on OpenJDK 17)
* **Build System**: Apache Maven 3.9+
* **Testing**: JUnit 4.13.2

---

## Getting Started

### Prerequisites
* **Java**: OpenJDK 17
* **Maven**: Apache Maven installed and available on your system path.

### Compilation
To compile the Gosu classes:
```bash
mvn compile
```

### Running Tests
To run the automated JUnit test suite:
```bash
mvn clean test
```

---

## Sprint Board & Status

* **Sprint 1 (Current)**: Setup environment & core Account domain models, validation, and in-memory services.
* **Future Sprints**: Underwriting authority, rating engine, policy lines, and Guidewire-inspired transactional bundle mechanics.
