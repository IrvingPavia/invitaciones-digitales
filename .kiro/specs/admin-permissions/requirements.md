# Requirements Document

## Introduction

This document defines the requirements for granular, module-level permission management for admin users. The system allows root users to assign specific module permissions to each admin user, restricting their access to only granted modules. Permissions are persisted in MySQL, embedded in JWT tokens at login, and enforced on both backend (middleware) and frontend (sidebar + route guards).

## Glossary

- **System**: The invitaciones-digitales application encompassing backend API and frontend Angular application
- **Root_User**: A user with role 'root' who has unrestricted access to all modules and can manage permissions for admin users
- **Admin_User**: A user with role 'admin' whose module access is controlled by assigned permissions
- **Client_User**: A user with role 'client' who does not participate in module-level permission checks
- **AdminModule**: One of the 10 defined modules: eventos, invitados, configuracion, tarjetas, usuarios, sugerencias, compras, metricas, eventos_expirados, paquetes_admin
- **Permission_Middleware**: The `requirePermission` Express middleware that enforces module access on backend routes
- **Permissions_Service**: The Angular service that provides permission checking on the frontend
- **Permission_Guard**: The Angular route guard that prevents unauthorized navigation
- **Sidebar**: The navigation component that displays links to accessible modules
- **JWT**: JSON Web Token containing user identity and permissions payload

## Requirements

### Requirement 1: Root Access Bypass

**User Story:** As a root user, I want to always have full access to every module, so that I can manage the entire system without restrictions.

#### Acceptance Criteria

1. WHEN a Root_User makes a request to any protected endpoint, THE Permission_Middleware SHALL allow the request regardless of the permissions array content, including when the permissions array is empty or contains no matching modules
2. WHEN the Permissions_Service checks any module for a Root_User, THE Permissions_Service SHALL return true without inspecting the permissions array
3. WHEN a Root_User navigates to any module route, THE Permission_Guard SHALL allow navigation without evaluating module permissions
4. THE System SHALL identify a Root_User solely by the role field in the decoded JWT being equal to 'root'

### Requirement 2: Admin Module Enforcement

**User Story:** As a system administrator, I want admin users to only access modules they have been explicitly granted, so that I can enforce principle of least privilege.

#### Acceptance Criteria

1. WHEN an Admin_User with role "admin" makes a request to a protected endpoint AND the required module is included in the Admin_User permissions array from the decoded JWT payload, THE Permission_Middleware SHALL allow the request to proceed to the route handler
2. WHEN an Admin_User with role "admin" makes a request to a protected endpoint AND the required module is NOT included in the Admin_User permissions array from the decoded JWT payload, THE Permission_Middleware SHALL return HTTP 403 with error message "No tienes permiso para este módulo"
3. WHEN the Permissions_Service checks a module for a user with role "admin", THE Permissions_Service SHALL return true only if the module is included in the Admin_User permissions array, and false otherwise
4. WHEN an Admin_User with role "admin" navigates to a module route without the required permission in their permissions array, THE Permission_Guard SHALL prevent navigation and redirect to "/dashboard"
5. IF a user with role "client" makes a request to an admin-protected endpoint, THEN THE Permission_Middleware SHALL return HTTP 403 with error message "No tienes permisos para esta acción"

### Requirement 3: Client Role Isolation

**User Story:** As a system architect, I want client users to be excluded from module permission checks entirely, so that their event-based access model remains independent.

#### Acceptance Criteria

1. WHEN a Client_User makes a request to a module-protected endpoint, THE Permission_Middleware SHALL return HTTP 403 with error message "No tienes permisos para esta acción" regardless of any admin_permissions records that may exist for that user in the database
2. WHEN the System generates a JWT for a Client_User, THE System SHALL set the permissions field to an empty array and SHALL NOT query the admin_permissions table for that user
3. IF a user with role 'client' is provided as target to PUT /api/admin/permissions/:userId, THEN THE System SHALL reject the request with HTTP 400 and an error message indicating that permissions can only be assigned to admin users
4. WHEN the Permission_Middleware processes a request from a Client_User, THE Permission_Middleware SHALL deny access based solely on the user's role without inspecting the permissions array in the JWT

### Requirement 4: Permission Management API

**User Story:** As a root user, I want to assign and modify module permissions for admin users through an API, so that I can control what each admin can access.

#### Acceptance Criteria

1. WHEN a Root_User sends a GET request to /api/admin/permissions/:userId and the target user exists, THE System SHALL return a JSON object containing a "permissions" property with an array of the user's currently assigned module strings
2. WHEN a Root_User sends a PUT request to /api/admin/permissions/:userId with a permissions array containing only values from the valid modules list (eventos, invitados, configuracion, tarjetas, usuarios, sugerencias, compras, metricas, eventos_expirados, paquetes_admin), THE System SHALL replace all existing permissions for that user with the provided array and return the updated permissions array in the response
3. WHEN a non-root user sends any request to /api/admin/permissions/:userId, THE System SHALL return HTTP 403
4. IF a GET or PUT request targets a userId that does not correspond to any existing user, THEN THE System SHALL return HTTP 404 with an error message indicating the user was not found
5. IF a PUT request targets a user whose role is not 'admin', THEN THE System SHALL return HTTP 400 with an error message indicating that permissions can only be assigned to admin users
6. WHEN a PUT request contains duplicate modules in the permissions array, THE System SHALL deduplicate the values before storing, resulting in the same state as if each module appeared only once
7. IF a PUT request contains a permissions value that is not in the valid modules list, THEN THE System SHALL return HTTP 400 with an error message indicating the invalid module name
8. WHEN a Root_User sends a PUT request with an empty permissions array, THE System SHALL remove all existing permissions for the target admin user, resulting in that admin having access to no modules

### Requirement 5: Atomic Permission Updates

**User Story:** As a root user, I want permission updates to be atomic, so that a failure during update does not leave permissions in an inconsistent state.

#### Acceptance Criteria

1. WHEN the System updates permissions for an Admin_User, THE System SHALL execute the delete and insert operations within a single database transaction using a dedicated connection from the pool
2. IF the transaction fails during permission update (during DELETE or INSERT), THEN THE System SHALL rollback all changes, release the connection back to the pool, and return HTTP 500 with an error message
3. WHEN a permission update transaction completes successfully, THE System SHALL commit the transaction, release the connection, and return the updated permissions array in a JSON response with HTTP 200

### Requirement 6: JWT Permission Embedding

**User Story:** As a developer, I want permissions included in the JWT at login, so that backend authorization checks do not require additional database queries per request.

#### Acceptance Criteria

1. WHEN an Admin_User logs in successfully, THE System SHALL query the admin_permissions table filtered by the authenticated user's ID and include the resulting module values as a string array in the JWT permissions field
2. WHEN a Root_User logs in successfully, THE System SHALL set the JWT permissions field to an empty array
3. WHEN a Client_User logs in successfully, THE System SHALL set the JWT permissions field to an empty array
4. THE JWT permissions field SHALL contain only valid AdminModule values as defined in the admin_permissions ENUM ('eventos', 'invitados', 'configuracion', 'tarjetas', 'usuarios', 'sugerencias', 'compras', 'metricas', 'eventos_expirados', 'paquetes_admin')
5. IF the admin_permissions query fails during an Admin_User login, THEN THE System SHALL reject the login attempt and return an error response indicating that permissions could not be loaded

### Requirement 7: Frontend Sidebar Filtering

**User Story:** As an admin user, I want to see only the modules I have access to in the sidebar, so that I have a clean and relevant navigation experience.

#### Acceptance Criteria

1. WHEN the Sidebar renders for a Root_User, THE Sidebar SHALL display all 10 module links and any links that have no required permission defined
2. WHEN the Sidebar renders for an Admin_User, THE Sidebar SHALL display only links whose required permission value is present in the Admin_User permissions array, plus any links that have no required permission defined
3. WHEN a Sidebar link has no required permission defined, THE Sidebar SHALL display that link regardless of the user role
4. IF an Admin_User has an empty permissions array, THEN THE Sidebar SHALL display only links that have no required permission defined and SHALL hide all permission-gated module links
5. IF the PermissionsService cannot retrieve the current user or the permissions data is unavailable, THEN THE Sidebar SHALL hide all permission-gated module links and display only links that have no required permission defined

### Requirement 8: Database Schema Integrity

**User Story:** As a developer, I want the database to enforce valid permissions at the storage level, so that invalid data cannot be persisted.

#### Acceptance Criteria

1. THE admin_permissions table SHALL have an id INT AUTO_INCREMENT PRIMARY KEY and use an ENUM column for the module field restricting values to exactly: 'eventos', 'invitados', 'configuracion', 'tarjetas', 'usuarios', 'sugerencias', 'compras', 'metricas', 'eventos_expirados', 'paquetes_admin'
2. THE admin_permissions table SHALL enforce a UNIQUE constraint on the combination of user_id and module, where both columns are defined as NOT NULL
3. WHEN a user is deleted from the users table, THE System SHALL cascade delete all corresponding rows in the admin_permissions table via the ON DELETE CASCADE clause on the foreign key
4. THE admin_permissions table SHALL reference the users table via a foreign key on user_id, where user_id is defined as INT NOT NULL matching the users.id primary key type
5. IF an INSERT or UPDATE attempts to store a module value not in the ENUM definition or a user_id that does not exist in the users table, THEN THE System SHALL reject the operation and return a constraint violation error

### Requirement 9: Permission Input Validation

**User Story:** As a developer, I want all permission inputs validated server-side, so that invalid module names cannot reach the database.

#### Acceptance Criteria

1. WHEN a PUT request to /api/admin/permissions/:userId contains a permissions array where any element is not one of the valid AdminModule values (eventos, invitados, configuracion, tarjetas, usuarios, sugerencias, compras, metricas, eventos_expirados, paquetes_admin), THE System SHALL return HTTP 400 with a JSON response containing an error message indicating which value is invalid, and SHALL NOT modify the database
2. WHEN a PUT request to /api/admin/permissions/:userId contains a permissions field that is not an array or is missing from the request body, THE System SHALL return HTTP 400 with a JSON response containing an error message indicating that permissions must be an array
3. THE System SHALL validate all permission inputs server-side using express-validator before any database operation, regardless of whether frontend validation was applied
4. WHEN a PUT request to /api/admin/permissions/:userId contains a permissions array with elements that are not strings, THE System SHALL return HTTP 400 with a JSON response containing a validation error message

### Requirement 10: Unauthenticated Request Handling

**User Story:** As a developer, I want unauthenticated requests to be properly rejected, so that the permission layer does not process requests without identity.

#### Acceptance Criteria

1. WHEN a request reaches the Permission_Middleware and req.user is not set (undefined or null), THE Permission_Middleware SHALL return an HTTP 401 response with a JSON body containing an error field with value "No autenticado" and SHALL NOT call the next middleware in the chain
2. IF req.user is set but does not contain a valid role property (one of "root", "admin", or "client"), THEN THE Permission_Middleware SHALL return an HTTP 403 response with a JSON body containing an error field indicating insufficient permissions
3. THE Permission_Middleware SHALL evaluate the req.user check before performing any module permission logic, ensuring that no permission query or comparison executes for unauthenticated requests
