# Project Specification for Hackathon Boilerplate

## 1. Environment & Tech Stack
- **Package Manager:** pnpm (MUST USE)
- **Framework:** NestJS (Latest)
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** TypeORM
- **Infrastructure:** Docker, Docker Compose
- **Docs:** Swagger (@nestjs/swagger)

## 2. Coding Rules & Guidelines (Strict Mode)

### Basic Principles
- **Language:** Use English for all code and documentation.
- **Type Safety:** Always declare types. **NEVER use `any`.**
- **Nomenclature:**
  - Classes: `PascalCase`
  - Variables/Functions: `camelCase`
  - Files/Directories: `kebab-case`
  - Constants: `UPPER_CASE`
- **Functions:**
  - Start with a verb (e.g., `createUser`, `isValid`).
  - Keep short (< 20 instructions).
  - **RO-RO Pattern:** Use an object to pass parameters and an object to return results (Receive Object, Return Object).

### Class & Data
- **DTOs:** Validated with `class-validator`.
- **Immutability:** Prefer `readonly` and `as const`.
- **Response Pattern:** NEVER return Entities directly in Controllers. Always use specific **Response DTOs**.

### Testing
- **Pattern:** Follow `Arrange-Act-Assert` (AAA).
- **Smoke Test:** Add a `GET /admin/test` method to each controller for quick health checks.

## 3. Architecture Structure

The project must follow a modular architecture:

```text
src/
├── core/                  # Global artifacts (Interceptors, Filters, Guards)
├── shared/                # Shared logic & utilities
├── config/                # Environment configuration
├── common/                # Constants, BaseExceptions
├── [domain]/ (e.g., users)
│   ├── dto/
│   │   ├── request/       # Input DTOs
│   │   └── response/      # Output DTOs (Transformation logic inside)
│   ├── entities/          # DB Entities
│   ├── [domain].controller.ts
│   ├── [domain].service.ts
│   └── [domain].module.ts
└── main.ts
4. Implementation Tasks (Agent Actions)
Please execute the following steps in order:
Step 1: Initialization
Initialize NestJS project using pnpm: nest new . --package-manager pnpm --skip-git
Install dependencies:
pnpm add @nestjs/typeorm typeorm pg @nestjs/config class-validator class-transformer @nestjs/swagger
Step 2: Infrastructure
Dockerfile: Create a multi-stage Dockerfile. Ensure pnpm is installed and used for building.
docker-compose.yml: Set up the NestJS app and PostgreSQL. Include a volume for DB persistence.
Step 3: Core Implementation
Create src/common/exception/base.exception.ts and Global Exception Filter.
Create src/core module.
Step 4: Reference Module (Users)
Implement a users module to demonstrate the coding rules:
Entity: User (id, email, nickname, password, createdAt).
Feature: GET /users/:id using RO-RO pattern and Response DTO.
Test: Add the smoke test endpoint (/users/admin/test).
Step 5: Seeding
Create a seed.ts script to insert dummy data (3 users) and register it in package.json scripts.