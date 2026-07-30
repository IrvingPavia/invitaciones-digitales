# Implementation Plan: Admin Permissions

## Overview

Implement granular, module-level permission management for admin users. The implementation follows a dependency-ordered approach: database schema first, then backend middleware, API routes, login modification, and finally frontend services/guards/sidebar integration.

## Tasks

- [ ] 1. Database schema and migration
  - [ ] 1.1 Create the admin_permissions table migration
    - Create file `backend/src/migrations/admin-permissions.sql` with the CREATE TABLE statement
    - Define `id INT AUTO_INCREMENT PRIMARY KEY`, `user_id INT NOT NULL`, `module ENUM(...)`, `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`
    - Add `UNIQUE KEY unique_user_module (user_id, module)` constraint
    - Add `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`
    - Use ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ] 1.2 Create a migration runner script for admin_permissions
    - Create file `backend/src/migrations/run-admin-permissions.js`
    - Read and execute the SQL file against the database using the existing `getDB()` pattern from `database.js`
    - _Requirements: 8.1_

- [ ] 2. Backend permission middleware
  - [ ] 2.1 Implement the requirePermission middleware
    - Create file `backend/src/middleware/permissions.js`
    - Export `requirePermission(...modules)` factory function returning Express middleware
    - If `req.user` is not set, return 401 with `{ error: "No autenticado" }`
    - If `req.user.role === 'root'`, call `next()` (bypass)
    - If `req.user.role === 'admin'`, check if at least one required module is in `req.user.permissions`; allow or return 403 with `{ error: "No tienes permiso para este módulo" }`
    - If role is `'client'` or any other value, return 403 with `{ error: "No tienes permisos para esta acción" }`
    - _Requirements: 1.1, 1.4, 2.1, 2.2, 2.5, 3.1, 3.4, 10.1, 10.2, 10.3_

  - [ ]* 2.2 Write property tests for requirePermission middleware
    - **Property 1: Root Bypass** — For any module and any permissions array, root always gets access
    - **Property 2: Admin Enforcement** — Admin with module M in permissions gets access iff M is in the required modules
    - **Property 3: Client Isolation** — Client role always gets 403 regardless of permissions content
    - **Validates: Requirements 1.1, 2.1, 2.2, 3.1, 10.1**

  - [ ]* 2.3 Write unit tests for requirePermission middleware
    - Test root bypass with empty permissions array
    - Test admin with matching permission passes
    - Test admin without matching permission gets 403
    - Test client always gets 403
    - Test unauthenticated (no req.user) gets 401
    - Test multiple modules (any match grants access)
    - _Requirements: 1.1, 2.1, 2.2, 2.5, 3.1, 10.1_

- [ ] 3. Backend permissions API routes
  - [ ] 3.1 Create the loadPermissionsForUser helper function
    - Create file `backend/src/services/permissions.service.js`
    - Export `loadPermissionsForUser(userId)` that queries `SELECT module FROM admin_permissions WHERE user_id = ?`
    - Return array of module strings
    - _Requirements: 6.1_

  - [ ] 3.2 Create validation schema for permission updates
    - Add `permissionsUpdateSchema` to `backend/src/middleware/validate.js`
    - Validate `permissions` is a required array
    - Each element must be a string matching one of the 10 valid AdminModule values using `Joi.string().valid(...)`
    - Add `userIdParamSchema` for validating the `:userId` route param as positive integer
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ] 3.3 Implement GET /api/admin/permissions/:userId endpoint
    - Create file `backend/src/routes/admin-permissions.js`
    - Apply `auth`, `requireRole('root')` middleware
    - Validate `:userId` param
    - Check target user exists, return 404 if not found
    - Query and return `{ permissions: [...] }`
    - _Requirements: 4.1, 4.3, 4.4_

  - [ ] 3.4 Implement PUT /api/admin/permissions/:userId endpoint
    - In the same route file, handle PUT with `auth`, `requireRole('root')`, `validate(permissionsUpdateSchema)`
    - Verify target user exists (404 if not) and has role 'admin' (400 if not)
    - Deduplicate the permissions array
    - Execute DELETE + INSERT in a single transaction using a dedicated connection
    - Return `{ success: true, permissions: [...] }` on success
    - Rollback and return 500 on failure, always release connection
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 5.1, 5.2, 5.3_

  - [ ] 3.5 Register the admin-permissions route in the Express app
    - In `backend/src/index.js`, require and mount the new route file at `/api/admin/permissions`
    - _Requirements: 4.1, 4.2_

  - [ ]* 3.6 Write property tests for permission update round-trip
    - **Property 4: Permission Update Round-Trip** — For any valid permissions array P, PUT then GET returns set-equal to P
    - **Property 5: Deduplication Idempotence** — Updating with duplicates yields same state as deduplicated
    - **Validates: Requirements 4.1, 4.2, 4.6, 5.3**

  - [ ]* 3.7 Write unit tests for admin-permissions API
    - Test GET returns current permissions for valid admin user
    - Test PUT replaces permissions atomically
    - Test 403 for non-root users
    - Test 404 for non-existent user
    - Test 400 for non-admin target user
    - Test 400 for invalid module names in payload
    - Test empty array removes all permissions
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.7, 4.8, 9.1, 9.2_

- [ ] 4. Checkpoint - Backend core complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Login modification to include permissions in JWT
  - [ ] 5.1 Modify the login route to include permissions in JWT payload
    - In `backend/src/routes/auth.js`, after successful password verification:
    - If `user.role === 'admin'`, call `loadPermissionsForUser(user.id)` to get permissions
    - For root and client, set permissions to empty array `[]`
    - Add `permissions` field to the JWT `sign()` payload
    - Add `permissions` field to the user response object
    - If permissions query fails for admin, return 500 error
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 5.2 Write property test for JWT-DB consistency at login
    - **Property 8: JWT-DB Consistency at Login** — For any admin with permissions P in DB, login JWT contains exactly P
    - **Validates: Requirements 6.1, 6.4**

  - [ ]* 5.3 Write unit tests for login with permissions
    - Test admin login includes permissions array from DB
    - Test root login has empty permissions array
    - Test client login has empty permissions array
    - Test login fails gracefully if permissions query errors
    - _Requirements: 6.1, 6.2, 6.3, 6.5_

- [ ] 6. Apply requirePermission to existing admin routes
  - [ ] 6.1 Add requirePermission middleware to all protected admin routes
    - Import `requirePermission` in route files that serve admin modules
    - Add `requirePermission('eventos')` to events routes
    - Add `requirePermission('invitados')` to guests routes
    - Add `requirePermission('configuracion')` to config routes
    - Add `requirePermission('tarjetas')` to cards routes
    - Add `requirePermission('usuarios')` to users routes
    - Add `requirePermission('sugerencias')` to suggestions routes
    - Add `requirePermission('compras')` to admin-purchases routes
    - Add `requirePermission('paquetes_admin')` to plans routes
    - Maintain existing `auth` and `requireRole` middleware in chain before `requirePermission`
    - _Requirements: 2.1, 2.2, 2.5_

- [ ] 7. Checkpoint - Backend fully wired
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Frontend PermissionsService
  - [ ] 8.1 Create the AdminModule type and PermissionsService
    - Create file `frontend/src/app/core/services/permissions.service.ts`
    - Define `AdminModule` type with the 10 valid module values
    - Inject `AuthService` to read user data
    - Implement `hasPermission(module: AdminModule): boolean` — root returns true, admin checks array, others false
    - Implement `hasAnyPermission(...modules: AdminModule[]): boolean`
    - Implement `getPermissions(): AdminModule[]`
    - Implement `isRoot(): boolean`
    - _Requirements: 1.2, 2.3, 7.5_

  - [ ]* 8.2 Write unit tests for PermissionsService
    - Test root always returns true for hasPermission
    - Test admin with permission returns true, without returns false
    - Test client always returns false
    - Test null user returns false
    - _Requirements: 1.2, 2.3_

- [ ] 9. Frontend Permission Guard
  - [ ] 9.1 Create the permissionGuard factory function
    - Create file `frontend/src/app/core/guards/permission.guard.ts`
    - Export `permissionGuard(module: AdminModule): CanActivateFn`
    - Inject `PermissionsService` and `Router`
    - If `hasPermission(module)` returns true, allow navigation
    - Otherwise, redirect to `/dashboard` and return false
    - _Requirements: 1.3, 2.4_

  - [ ] 9.2 Apply permissionGuard to dashboard child routes
    - In `frontend/src/app/app.routes.ts`, add `canActivate: [() => permissionGuard('module')]` to each admin route
    - Map routes to modules: events→eventos, guests→invitados, config→configuracion, cards→tarjetas, users→usuarios, suggestions→sugerencias, admin/compras→compras, admin/metricas→metricas, admin/eventos-expirados→eventos_expirados, admin/paquetes→paquetes_admin
    - _Requirements: 2.4_

- [ ] 10. Frontend Sidebar filtering with permissions
  - [ ] 10.1 Refactor DashboardComponent sidebar to use PermissionsService
    - Inject `PermissionsService` in `dashboard.component.ts`
    - Define a data-driven array of sidebar links with `requiredPermission` property
    - Filter visible links using `permissionsService.hasPermission()` in the template or a computed getter
    - Links without a `requiredPermission` (e.g., Dashboard home) always display
    - Root sees all links; admin sees only permitted links; client sees their own links (unchanged)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 11. Final checkpoint - Full integration
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The project uses Joi for validation (not express-validator); tasks reference Joi-based validation to match the existing codebase pattern
- Backend tests use Jest (see package.json devDependencies)
- Frontend uses Angular 18 standalone components with functional guards

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "3.1", "3.2"] },
    { "id": 2, "tasks": ["2.2", "2.3", "3.3", "3.4"] },
    { "id": 3, "tasks": ["3.5", "3.6", "3.7"] },
    { "id": 4, "tasks": ["5.1"] },
    { "id": 5, "tasks": ["5.2", "5.3", "6.1"] },
    { "id": 6, "tasks": ["8.1"] },
    { "id": 7, "tasks": ["8.2", "9.1"] },
    { "id": 8, "tasks": ["9.2", "10.1"] }
  ]
}
```
