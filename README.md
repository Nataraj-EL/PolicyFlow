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

* **Language**: Gosu 1.18.7 (runs on OpenJDK 17) & Java 17
* **Web Framework**: Spring Boot 3.2.5
* **API Documentation**: OpenAPI 3 / Swagger (Springdoc v2.5.0)
* **Build System**: Apache Maven 3.9+
* **Testing**: JUnit 4 (for Gosu) and JUnit 5 + Spring Boot Test + MockMvc (for Java REST API)

---

## REST API Documentation

PolicyFlow exposes a rich REST API layer for client interaction. All business and domain validations run in Gosu, while the controller and DTO mappings run in Java.

### Key Endpoints

- **System info & Health**:
  - `GET /` -> Application details and Swagger URLs.
  - `GET /api/health` -> Health status check (`{"status":"UP"}`).
- **Contacts**: `GET /api/contacts`, `GET /api/contacts/{id}`, `POST /api/contacts`, `PUT /api/contacts/{id}`, `DELETE /api/contacts/{id}`
- **Vehicles**: `GET /api/vehicles`, `GET /api/vehicles/{id}`, `POST /api/vehicles`, `PUT /api/vehicles/{id}`, `DELETE /api/vehicles/{id}`
- **Policies**:
  - `GET /api/policies`, `GET /api/policies/{id}`, `POST /api/policies`, `PUT /api/policies/{id}`
  - `POST /api/policies/{id}/cancel?reason=...&cancellationDate=...` -> Cancels a policy.
  - `POST /api/policies/{id}/renew` -> Renews a policy for a new term.
  - `POST /api/policies/{id}/reinstate?reason=...` -> Reinstates a cancelled policy.
  - `GET /api/policies/{id}/history` -> Retrieves transaction history audit log.
- **Claims**:
  - `GET /api/claims`, `GET /api/claims/{id}`, `POST /api/claims`, `PUT /api/claims/{id}`
  - `POST /api/claims/{id}/close?reason=...` -> Closes an open claim.
- **Premium**: `POST /api/premium/calculate` -> Simulates premium breakdown dynamically.
- **Reporting**: `GET /api/reporting/summary` -> Computes real-time portfolio metrics.
- **Search**:
  - `GET /api/search/contacts` -> Filter contacts by `firstName`, `lastName`, `email`, `vehicleMake`.
  - `GET /api/search/policies` -> Filter policies by `policyNumber`, `contactFirstName`, `contactLastName`, `status`, `type`.
  - `GET /api/search/claims` -> Filter claims by `claimNumber`, `status`, `vin`, `contactEmail`.

### How to Run Locally

1. **Clean and Compile**:
   ```bash
   mvn clean compile
   ```
2. **Start Spring Boot REST Server**:
   ```bash
   mvn spring-boot:run
   ```
3. **Access Interactive Docs**:
   Open [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html) in your browser.

---

## Sprint Board & Status

* **Sprint 01 - 09**: Setup core domain layers, underwriting rules, dynamic rating engine, search engines, error formats, and indexing.
* **Sprint 10 (Current)**: REST API Layer integration. Expose repositories and services as Spring Boot REST controllers.

