# Implementation Plan: Sistema de Comercialización Vitely

## Overview

Implementación del sistema de pago por evento para Vitely. Se construye de forma incremental: primero la base de datos y servicios backend, luego los endpoints API, seguido por la integración de pagos, y finalmente los componentes frontend. Se usa JavaScript (Node.js/Express) para el backend y Angular 18 (TypeScript) para el frontend.

## Tasks

- [x] 1. Base de datos y modelos de datos
  - [x] 1.1 Crear migración SQL para nuevas tablas y columnas
    - Crear archivo `backend/src/migrations/subscription-plans.sql` con:
    - ALTER TABLE `users`: agregar columnas `email`, `email_verified`, `verification_status`, `self_registered`, `full_name`, `trial_used`
    - ALTER TABLE `events`: agregar columnas `lifecycle_status`, `deactivation_date`, `purchase_id`, `postponed`, `plan_type`
    - CREATE TABLE `plans` con todas las columnas definidas en el diseño
    - CREATE TABLE `purchases` con FKs a users y plans
    - CREATE TABLE `transactions` con FKs a purchases y users
    - CREATE TABLE `email_verifications` con FK a users
    - CREATE TABLE `postponements` con FKs a events, users, transactions
    - Agregar índices para búsquedas frecuentes (email en users, status en plans, user_id en purchases)
    - _Requirements: 2.1, 2.2, 2.4, 4.5, 5.9_

  - [x] 1.2 Crear script de ejecución de migración
    - Crear `backend/src/migrations/run-subscription-plans.js` que ejecute el SQL contra la base de datos
    - Usar la conexión de `database.js` existente
    - Agregar script `migrate:plans` en `package.json`
    - _Requirements: 2.1_

- [x] 2. Servicios backend core
  - [x] 2.1 Implementar Email Service
    - Crear `backend/src/services/email.service.js`
    - Instalar `nodemailer` como dependencia
    - Implementar `sendVerificationEmail(to, token, name)` con template HTML
    - Implementar `sendPaymentConfirmation(to, purchaseDetails)`
    - Implementar `sendPostponementConfirmation(to, eventDetails)`
    - Implementar `resendVerification(userId)` con validación de rate limiting
    - Configurar transporte SMTP desde variables de entorno
    - _Requirements: 1.5, 1.7_

  - [x] 2.2 Implementar Lifecycle Service
    - Crear `backend/src/services/lifecycle.service.js`
    - Implementar `calculateDeactivationDate(eventDate)` que retorna eventDate + 3 días
    - Implementar `getEventLifecycleStatus(eventId)` que consulta el estado actual
    - Implementar `deactivateExpiredEvents()` para uso manual por admin
    - _Requirements: 5.1, 5.2, 5.4_

  - [ ]* 2.3 Write property test: Fecha de desactivación siempre es event_date + 3 días
    - **Property 8: Fecha de desactivación siempre es event_date + 3 días**
    - **Validates: Requirements 5.1, 5.8**
    - Usar fast-check para generar fechas arbitrarias y verificar que deactivation_date = event_date + 3 días calendario

  - [ ]* 2.4 Write property test: Estado del lifecycle determinado por fecha actual
    - **Property 9: Estado del lifecycle determinado por fecha actual**
    - **Validates: Requirements 5.2, 5.4**
    - Verificar que lifecycle_status es 'completed' si y solo si NOW() > deactivation_date

  - [x] 2.5 Implementar Payment Service
    - Crear `backend/src/services/payment.service.js`
    - Instalar `stripe` y `mercadopago` como dependencias
    - Implementar `createStripeSession(userId, planId, quantity, successUrl, cancelUrl)`
    - Implementar `createMercadoPagoPreference(userId, planId, quantity, successUrl, cancelUrl)`
    - Implementar `handleStripeWebhook(rawBody, signature)` con verificación HMAC
    - Implementar `handleMPWebhook(body)` con consulta GET de confirmación
    - Implementar `processPostponementPayment(userId, eventId, gateway)`
    - Implementar lógica de idempotencia para webhooks
    - _Requirements: 4.1, 4.2, 4.5, 4.6, 4.7_

  - [x] 2.6 Implementar cálculo de descuento por volumen
    - Agregar función `calculateVolumeDiscount(planId, quantity)` en payment service
    - Leer reglas de `volume_discount` JSON del plan
    - Aplicar el mayor `discount_pct` cuyo `min_qty` no exceda la cantidad
    - Calcular total como `price × quantity × (1 - discount/100)`
    - _Requirements: 2.5, 3.3, 3.6_

  - [ ]* 2.7 Write property test: Cálculo de descuento por volumen y monto total
    - **Property 4: Cálculo de descuento por volumen y monto total**
    - **Validates: Requirements 2.5, 3.3, 3.6**
    - Verificar fórmula P × Q × (1 - D/100) y monotonicidad del descuento

  - [ ]* 2.8 Write property test: Inmutabilidad de precios en compras existentes
    - **Property 5: Inmutabilidad de precios en compras existentes**
    - **Validates: Requirements 2.6**
    - Verificar que unit_price y total_amount de una compra no cambian al modificar el precio del plan

- [x] 3. Middleware de permisos y acceso
  - [x] 3.1 Implementar Permission Middleware
    - Crear `backend/src/middleware/packageAccess.js`
    - Implementar `requirePackageFeature(feature)` que valida acceso según plan del evento
    - Implementar `requireActiveEvent` que verifica lifecycle_status !== 'completed'
    - Admin/root bypass para usuarios no self_registered
    - Mapeo de features por paquete según diseño
    - Retornar códigos de error específicos (`FEATURE_NOT_INCLUDED`, `EVENT_COMPLETED`)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.6, 9.7, 9.8_

  - [ ]* 3.2 Write property test: Evaluación de permisos por tipo de paquete
    - **Property 12: Evaluación de permisos por tipo de paquete**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.6**
    - Generar tuplas (usuario, evento, feature) y verificar acceso según features del plan

  - [ ]* 3.3 Write property test: Eventos completados son de solo lectura
    - **Property 13: Eventos completados son de solo lectura**
    - **Validates: Requirements 9.7**
    - Verificar que escritura es rechazada y lectura permitida para eventos completed

- [x] 4. Checkpoint - Verificar servicios core
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Rutas de registro y verificación
  - [x] 5.1 Implementar rutas de registro
    - Crear `backend/src/routes/register.js`
    - POST `/api/register`: validar input con Joi, crear usuario con bcrypt hash, generar token UUID, guardar en email_verifications, enviar email
    - POST `/api/register/verify/:token`: validar token no expirado (24h), activar cuenta, retornar JWT
    - POST `/api/register/resend`: buscar usuario por email, validar estado pending, generar nuevo token, enviar email
    - Registrar rutas en `index.js`
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

  - [ ]* 5.2 Write property test: El registro siempre crea usuarios con defaults correctos
    - **Property 1: El registro siempre crea usuarios con defaults correctos**
    - **Validates: Requirements 1.3**
    - Verificar que toda cuenta creada tiene role='client', verification_status='pending', self_registered=1, email_verified=0

  - [ ]* 5.3 Write property test: La validez del token de verificación está acotada por tiempo
    - **Property 2: La validez del token de verificación está acotada por tiempo**
    - **Validates: Requirements 1.6, 1.7**
    - Generar tiempos de acceso y verificar que token es válido solo si edad ≤ 24h

  - [ ]* 5.4 Write property test: Usuarios no verificados están bloqueados del dashboard
    - **Property 3: Usuarios no verificados están bloqueados del dashboard**
    - **Validates: Requirements 1.8**
    - Verificar que todas las rutas de dashboard retornan error para usuarios pending

- [x] 6. Rutas de paquetes (plans)
  - [x] 6.1 Implementar rutas públicas y admin de planes
    - Crear `backend/src/routes/plans.js`
    - GET `/api/plans`: retornar planes activos con features, precio, descuentos
    - GET `/api/plans/:id`: retornar detalle de un plan
    - POST `/api/admin/plans`: crear plan (requiere role root/admin)
    - PUT `/api/admin/plans/:id`: editar plan
    - PATCH `/api/admin/plans/:id/status`: activar/desactivar plan
    - Validación Joi para todos los endpoints de admin
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.7, 3.1, 3.2, 3.5_

  - [ ]* 6.2 Write property test: Visibilidad de planes respeta su estado
    - **Property 6: Visibilidad de planes respeta su estado**
    - **Validates: Requirements 2.7**
    - Verificar que el catálogo público solo muestra planes activos

- [x] 7. Rutas de pagos y webhooks
  - [x] 7.1 Implementar rutas de pagos
    - Crear `backend/src/routes/payments.js`
    - POST `/api/payments/create-session`: crear purchase + transaction pending, crear sesión en gateway
    - POST `/api/payments/webhook/stripe`: verificar firma, procesar pago, crear eventos, enviar email
    - POST `/api/payments/webhook/mercadopago`: verificar con GET, procesar pago, crear eventos
    - GET `/api/payments/status/:transactionId`: estado de transacción del usuario
    - Usar `express.raw()` para el body del webhook de Stripe
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 7.2 Write property test: Webhook de pago exitoso crea exactamente N eventos
    - **Property 7: Webhook de pago exitoso crea exactamente N eventos**
    - **Validates: Requirements 4.3**
    - Verificar que un pago exitoso de N eventos crea exactamente N registros con lifecycle_status='available'

- [x] 8. Rutas de mis eventos y postergaciones
  - [x] 8.1 Implementar rutas de mis eventos
    - Crear `backend/src/routes/my-events.js`
    - GET `/api/my-events`: listar eventos del usuario con estado y días restantes
    - POST `/api/my-events/:id/activate`: asignar fecha, calcular deactivation_date, cambiar a 'active'
    - POST `/api/my-events/:id/postpone`: validar 3 reglas (>7 días, no postergado, activo), retornar tarifa
    - POST `/api/my-events/:id/postpone/pay`: crear sesión de pago por postergación
    - Webhook actualiza fecha al confirmar pago de postergación
    - _Requirements: 5.1, 5.3, 5.5, 5.6, 5.7, 5.8, 5.9, 8.1, 8.2_

  - [ ]* 8.2 Write property test: Validación de postergación combina tres reglas
    - **Property 10: Validación de postergación combina tres reglas**
    - **Validates: Requirements 5.5, 5.6, 5.7**
    - Generar combinaciones de (días restantes, postponed flag, lifecycle_status) y verificar resultado

  - [ ]* 8.3 Write property test: Nueva compra preserva eventos existentes
    - **Property 11: Nueva compra preserva eventos existentes**
    - **Validates: Requirements 8.3**
    - Verificar que crear nuevos eventos no altera los existentes del usuario

- [x] 9. Rutas de perfil y administración
  - [x] 9.1 Implementar rutas de perfil
    - Crear `backend/src/routes/profile.js`
    - GET `/api/profile`: datos del usuario autenticado
    - PUT `/api/profile`: actualizar nombre y/o email (email requiere re-verificación)
    - PUT `/api/profile/password`: cambiar contraseña (requiere contraseña actual)
    - GET `/api/profile/purchases`: historial de compras del usuario
    - _Requirements: 8.4, 8.5, 8.6_

  - [x] 9.2 Implementar rutas de administración de compras
    - Crear `backend/src/routes/admin-purchases.js`
    - GET `/api/admin/purchases`: listado con filtros (estado, paquete, fecha) y paginación
    - GET `/api/admin/purchases/:id`: detalle de compra con eventos y transacciones
    - PUT `/api/admin/events/:id/extend`: extender deactivation_date con audit log
    - GET `/api/admin/metrics`: dashboard métricas (ingresos mes, ventas por paquete, conversión trial)
    - GET `/api/admin/purchases/export`: exportar Excel con `xlsx` package
    - GET `/api/admin/events/expired`: listar eventos con deactivation_date vencida
    - POST `/api/admin/events/deactivate-expired`: batch deactivation
    - PATCH `/api/admin/events/:id/complete`: marcar evento individual como completado
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 10. Checkpoint - Verificar backend completo
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Frontend - Servicios y guards
  - [x] 11.1 Crear servicios Angular para la API
    - Crear `frontend/src/app/services/plans.service.ts` con métodos para CRUD planes y catálogo
    - Crear `frontend/src/app/services/payment.service.ts` con createSession y getStatus
    - Crear `frontend/src/app/services/my-events.service.ts` con listado, activate, postpone
    - Crear `frontend/src/app/services/profile.service.ts` con get/update profile y purchases
    - Crear `frontend/src/app/services/register.service.ts` con register, verify, resend
    - _Requirements: 1.2, 3.2, 4.2, 8.1, 8.5_

  - [x] 11.2 Crear guards de acceso
    - Crear `frontend/src/app/guards/verified.guard.ts` que bloquea dashboard si email no verificado
    - Crear `frontend/src/app/guards/package.guard.ts` que verifica feature access por evento
    - Integrar guards en las rutas del app-routing
    - _Requirements: 1.8, 9.1, 9.2, 9.3, 9.6_

- [x] 12. Frontend - Páginas públicas
  - [x] 12.1 Implementar componente de registro
    - Crear `frontend/src/app/pages/register/register.component.ts` (standalone)
    - Formulario reactivo con validación (nombre, email, password min 8 chars)
    - Manejo de errores (email ya existe, validación)
    - Redirect a página de "revisa tu correo" en éxito
    - _Requirements: 1.1, 1.2, 1.4_

  - [x] 12.2 Implementar componente de verificación de email
    - Crear `frontend/src/app/pages/verify-email/verify-email.component.ts` (standalone)
    - Leer token de la URL, llamar API de verificación
    - Mostrar éxito y redirect a dashboard, o error con opción de reenvío
    - _Requirements: 1.6, 1.7_

  - [x] 12.3 Implementar sección de paquetes en landing pública
    - Crear `frontend/src/app/pages/pricing-public/pricing-public.component.ts` (standalone)
    - Cards comparativas con nombre, precio, features, límite invitados
    - Tabla comparativa de features
    - Sección FAQ
    - Botón "Comenzar" redirige a registro con paquete preseleccionado (query param)
    - Información de descuento por volumen
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 13. Frontend - Dashboard de usuario
  - [x] 13.1 Implementar catálogo de paquetes en dashboard
    - Crear `frontend/src/app/pages/plans-catalog/plans-catalog.component.ts` (standalone)
    - Mostrar planes con selector de cantidad
    - Cálculo de precio con descuento en tiempo real
    - Paquete "Completo" resaltado como recomendado
    - Activación inmediata de Trial sin pago
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 13.2 Implementar componente de checkout
    - Crear `frontend/src/app/pages/checkout/checkout.component.ts` (standalone)
    - Resumen de compra (plan, cantidad, descuento, total)
    - Selección de gateway (Stripe / MercadoPago)
    - Redirect a pasarela de pago
    - Página de retorno success/cancel
    - _Requirements: 4.1, 4.2, 4.6_

  - [x] 13.3 Implementar página Mis Eventos
    - Crear `frontend/src/app/pages/my-events/my-events.component.ts` (standalone)
    - Listar eventos por estado (disponibles, activos, completados)
    - Para eventos disponibles: formulario de asignación de fecha
    - Para eventos activos: mostrar días restantes, botón de postergar
    - Modal de postergación con tarifa y restricciones
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 13.4 Implementar página de perfil
    - Crear `frontend/src/app/pages/profile/profile.component.ts` (standalone)
    - Formulario de edición de nombre y email
    - Formulario de cambio de contraseña (contraseña actual + nueva)
    - Historial de compras con tabla
    - _Requirements: 8.4, 8.5, 8.6_

- [x] 14. Frontend - Panel de administración
  - [x] 14.1 Implementar administración de paquetes
    - Crear `frontend/src/app/pages/admin/plans-admin/plans-admin.component.ts` (standalone)
    - CRUD de planes con formulario modal
    - Toggle de estado activo/inactivo con confirmación
    - Vista de eventos activos afectados al desactivar
    - _Requirements: 2.4, 6.5_

  - [x] 14.2 Implementar administración de compras y métricas
    - Crear `frontend/src/app/pages/admin/purchases-admin/purchases-admin.component.ts` (standalone)
    - Listado con filtros y paginación
    - Detalle de compra con eventos y transacciones
    - Botón de extender fecha de desactivación con confirmación
    - Exportar Excel
    - Crear `frontend/src/app/pages/admin/metrics/metrics.component.ts` (standalone)
    - Dashboard con ingresos, ventas por paquete, conversión trial
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.6_

  - [x] 14.3 Implementar sección de eventos expirados en admin
    - Crear `frontend/src/app/pages/admin/expired-events/expired-events.component.ts` (standalone)
    - Listado de eventos con deactivation_date vencida
    - Badge con cantidad pendiente
    - Botón "Desactivar todos" con modal de confirmación
    - Botón individual por evento
    - _Requirements: 5.2, 6.3_

- [x] 15. Integración de rutas y wiring final
  - [x] 15.1 Configurar rutas Angular y navegación
    - Agregar rutas nuevas al routing module con guards aplicados
    - Agregar links en navegación principal (landing: "Paquetes", "Registrarse")
    - Agregar links en sidebar dashboard ("Mis Eventos", "Perfil", "Paquetes")
    - Agregar links en sidebar admin ("Compras", "Métricas", "Eventos Expirados", "Paquetes")
    - _Requirements: 1.1, 7.1, 8.1_

  - [x] 15.2 Registrar rutas backend y middleware
    - Registrar todas las nuevas rutas en `backend/src/index.js`
    - Agregar middleware `requirePackageFeature` en rutas existentes de cards, events, guests donde aplique
    - Configurar `express.raw()` para webhook routes
    - Agregar variables de entorno al `.env.example`
    - _Requirements: 9.1, 9.2, 9.3, 9.8_

  - [ ]* 15.3 Write unit tests para endpoints principales
    - Tests de registro (datos válidos, email duplicado, verificación)
    - Tests de planes (catálogo público, CRUD admin)
    - Tests de pagos (crear sesión, webhook processing)
    - Tests de permisos (feature access, event completed)
    - _Requirements: 1.2, 1.3, 2.7, 4.2, 9.1_

- [x] 16. Final checkpoint - Verificar implementación completa
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- El cron job de lifecycle NO se implementa en esta versión (documentado para futuro)
- Se usa administración manual para desactivar eventos expirados
- Dependencias nuevas: `nodemailer`, `stripe`, `mercadopago`, `fast-check`, `jest`, `supertest`, `xlsx`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["2.1", "2.2", "2.5", "2.6"] },
    { "id": 3, "tasks": ["2.3", "2.4", "2.7", "2.8", "3.1"] },
    { "id": 4, "tasks": ["3.2", "3.3", "5.1", "6.1"] },
    { "id": 5, "tasks": ["5.2", "5.3", "5.4", "6.2", "7.1"] },
    { "id": 6, "tasks": ["7.2", "8.1", "9.1", "9.2"] },
    { "id": 7, "tasks": ["8.2", "8.3", "11.1"] },
    { "id": 8, "tasks": ["11.2", "12.1", "12.2", "12.3"] },
    { "id": 9, "tasks": ["13.1", "13.2", "13.3", "13.4"] },
    { "id": 10, "tasks": ["14.1", "14.2", "14.3"] },
    { "id": 11, "tasks": ["15.1", "15.2"] },
    { "id": 12, "tasks": ["15.3"] }
  ]
}
```
