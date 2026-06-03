# Salary Management Tool Requirements

## Assessment Summary

The assessment asks for an end-to-end salary management web application for ACME's HR Manager. The current workflow is spreadsheet-based and difficult to use for managing salary data across 10,000 employees in multiple countries.

The expected solution should include a functional backend, a React or Next.js UI, a relational database, a seed script for 10,000 employees, meaningful tests, clear documentation, and supporting artifacts that explain the engineering approach. The assessment emphasizes good judgment over unnecessary complexity: clear product thinking, maintainable architecture, strong testing, practical performance decisions, intentional AI usage, and incremental commits.

## Goal

Build a minimal, high-quality salary management web application that lets an HR Manager manage employee salary records and answer common compensation questions across countries, departments, and job titles.

## Primary User

The primary user is an HR Manager at ACME who currently manages employee salary data in spreadsheets. They need a simple web interface to search, update, and review salary information without needing database knowledge or engineering support.

## In Scope

### Employee Management

- View employees in a paginated table.
- Search and filter employees by country and job title.
- Add, edit, and delete employee records.
- Store employee name, country, job title, department, salary, and timestamps.

### Salary Insights

- Minimum salary by country.
- Maximum salary by country.
- Average salary by country.
- Average salary for a job title within a country.
- Employee count by country.
- Salary range by country.
- Average salary by department or job title.

### Data Scale And Performance

- Seed 10,000 deterministic employee records.
- Keep employee list APIs paginated.
- Apply filtering and sorting at the database level.
- Use database aggregate queries for salary insights instead of loading full datasets into application memory.
- Add indexes for common lookup and analytics paths where they improve query performance.

### Quality And Reliability

- Use transactions for create, update, delete, and seed operations.
- Return consistent validation, not-found, database integrity, and server error responses.
- Avoid leaking internal error details to the frontend.
- Log useful backend errors for debugging.
- Include meaningful backend tests for CRUD, validation, salary insights, transaction behavior, and deterministic seed behavior.
- Include frontend tests for key user flows where practical.

### Developer Experience

- Provide setup, migration, seed, test, and run commands.
- Document architecture, database design, trade-offs, performance considerations, AI usage notes, and deployment guidance.
- Keep the repository structure easy for reviewers to understand.

## Out Of Scope

- Authentication, authorization, and role management.
  - Reason: these are important for a real HR system, but the assessment focuses on salary management, insights, architecture, and testing. Adding auth would increase scope without improving the core evaluation.
- Audit logs and approval workflows.
  - Reason: useful in production, but not required to demonstrate employee CRUD, aggregate salary insights, and clean architecture.
- Payroll processing, tax rules, currency conversion, or compensation planning workflows.
  - Reason: these require domain-specific business rules that were not requested.
- Excel import and export.
  - Reason: the problem starts from spreadsheets, but the requested deliverable is a web app with seeded data, not a migration tool.
- Advanced BI dashboards, forecasting, market benchmarking, or chart-heavy analytics.
  - Reason: focused SQL aggregate insights are sufficient and more assessment-friendly.
- Multi-tenant organization support.
  - Reason: ACME is the only stated organization. Multi-tenancy would complicate schema, authorization, and API design prematurely.

## Success Criteria

- HR can manage employee salary records through a clean UI without technical knowledge.
- Employee list views remain responsive through pagination and database-side filtering.
- Salary insights are computed with SQL aggregate queries and remain fast for 10,000 employees.
- Backend code is layered, testable, and keeps business logic outside route handlers.
- Tests are deterministic and verify meaningful behavior rather than implementation details.
- Documentation makes the project easy for reviewers to run, inspect, and evaluate.

## Verification For This Step

- Confirm this document matches the assessment goal and clearly states deliberate exclusions.
- Confirm no backend or frontend implementation has started.
- Confirm the document is concise enough to serve as the requested one-page requirements artifact.

## Proposed Commit Message

`docs: add salary management requirements document`
