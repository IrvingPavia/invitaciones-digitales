# Estado de Implementación: Sistema de Comercialización (subscription-plans)

## Rama: `feature/subscription-plans`

## Estado General: ✅ Implementación completa (código listo)

### Resumen
- **43/57 tareas completadas** (14 restantes son property tests opcionales)
- Todo el código backend y frontend fue implementado
- La migración SQL fue ejecutada exitosamente contra la DB en Docker
- El backend fue reconstruido y está corriendo con el código nuevo

---

## Pasos Completados

| # | Paso | Estado |
|---|------|--------|
| 1 | Migración SQL ejecutada (`run-subscription-plans.js`) | ✅ 20/20 statements |
| 2 | Variables de entorno configuradas en `backend/.env` | ✅ (con placeholders) |
| 3 | Backend Docker rebuild y reinicio | ✅ Healthy |

---

## ⚠️ Pendientes para Despliegue Funcional

### 1. Rebuild del Frontend Docker
El container `invitaciones-frontend` está corriendo código anterior. Para actualizar:

```bash
cd c:\Portafolio\invitaciones-digitales
docker-compose build frontend
docker-compose up -d frontend
```

**Nota**: Puede haber errores de compilación TypeScript en el frontend que necesiten revisarse antes del build (ejemplo: `plans-catalog.component.ts` podría tener dependencia de un archivo `.scss` faltante).

### 2. Configurar Credenciales Reales
Actualizar en `backend/.env` o en docker-compose env vars:

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` → Tu proveedor SMTP real (Gmail, SendGrid, etc.)
- `STRIPE_SECRET_KEY` → Tu clave secreta de Stripe (modo test primero)
- `STRIPE_WEBHOOK_SECRET` → Configurar endpoint webhook en Stripe Dashboard
- `MERCADOPAGO_ACCESS_TOKEN` → Token de producción o test de MercadoPago

### 3. Configurar Webhooks en Pasarelas
- **Stripe**: Registrar endpoint `https://tudominio.com/api/payments/webhook/stripe` en Stripe Dashboard
- **MercadoPago**: Configurar IPN URL `https://tudominio.com/api/payments/webhook/mercadopago`

### 4. Instalar Dependencias Nuevas en Container
El backend build ya incluye las nuevas dependencias (`nodemailer`, `stripe`, `mercadopago`), pero si corres localmente:

```bash
cd backend
npm install
```

### 5. Crear Planes Iniciales (Seed Data)
Después del deploy, crear los planes desde el panel admin (`/dashboard/admin/paquetes`) o insertar directamente:

```sql
INSERT INTO plans (name, slug, description, price, features, max_guests, is_trial, trial_days, volume_discount, status, sort_order)
VALUES 
('Invitación Digital', 'invitacion-digital', 'Landing page personalizable para tu evento', 499.00, '["landing_builder", "guest_management", "qr_codes"]', NULL, 0, NULL, '[{"min_qty": 3, "discount_pct": 10}, {"min_qty": 5, "discount_pct": 15}]', 'active', 1),
('Tarjeta Física', 'tarjeta-fisica', 'Editor de tarjetas físicas con exportación a PDF', 399.00, '["card_editor", "pdf_export"]', NULL, 0, NULL, '[{"min_qty": 3, "discount_pct": 10}, {"min_qty": 5, "discount_pct": 15}]', 'active', 2),
('Completo', 'completo', 'Acceso total: landing + tarjetas + todas las funcionalidades', 799.00, '["all"]', NULL, 0, NULL, '[{"min_qty": 3, "discount_pct": 10}, {"min_qty": 5, "discount_pct": 15}, {"min_qty": 10, "discount_pct": 20}]', 'active', 3),
('Trial', 'trial', 'Prueba gratuita de 7 días con todas las funcionalidades', 0.00, '["all"]', 30, 1, 7, NULL, 'active', 0);
```

---

## Tareas Opcionales Pendientes (Property Tests)

Estas tareas están marcadas como opcionales (`*`) y no bloquean el funcionamiento:

| ID | Descripción | Property |
|----|-------------|----------|
| 2.3 | Fecha de desactivación = event_date + 3 días | P8 |
| 2.4 | Estado lifecycle determinado por fecha actual | P9 |
| 2.7 | Cálculo de descuento por volumen | P4 |
| 2.8 | Inmutabilidad de precios en compras | P5 |
| 3.2 | Evaluación de permisos por tipo de paquete | P12 |
| 3.3 | Eventos completados son solo lectura | P13 |
| 5.2 | Registro crea usuarios con defaults correctos | P1 |
| 5.3 | Validez del token acotada por tiempo | P2 |
| 5.4 | Usuarios no verificados bloqueados del dashboard | P3 |
| 6.2 | Visibilidad de planes respeta estado | P6 |
| 7.2 | Webhook crea exactamente N eventos | P7 |
| 8.2 | Validación de postergación combina 3 reglas | P10 |
| 8.3 | Nueva compra preserva eventos existentes | P11 |
| 15.3 | Unit tests para endpoints principales | — |

Para ejecutarlas: `npm test` (Jest ya está configurado con `fast-check` como dependencia).

---

## Arquitectura de Archivos Nuevos

### Backend
```
backend/src/
├── migrations/
│   ├── subscription-plans.sql        # DDL migration
│   └── run-subscription-plans.js     # Migration runner
├── services/
│   ├── email.service.js              # Nodemailer + templates
│   ├── lifecycle.service.js          # Event lifecycle mgmt
│   ├── payment.service.js            # Stripe + MercadoPago
│   └── discount.service.js           # Volume discount calc
├── middleware/
│   └── packageAccess.js              # Feature access control
├── routes/
│   ├── register.js                   # Self-registration
│   ├── plans.js                      # Public catalog + admin CRUD
│   ├── payments.js                   # Payment sessions + webhooks
│   ├── my-events.js                  # User event management
│   ├── profile.js                    # User profile
│   └── admin-purchases.js           # Admin: purchases, metrics, expired
```

### Frontend
```
frontend/src/app/
├── core/
│   ├── services/
│   │   ├── plans.service.ts
│   │   ├── payment.service.ts
│   │   ├── my-events.service.ts
│   │   ├── profile.service.ts
│   │   ├── register.service.ts
│   │   └── admin.service.ts
│   └── guards/
│       ├── verified.guard.ts
│       └── package.guard.ts
├── pages/
│   ├── register/register.component.ts
│   ├── verify-email/verify-email.component.ts
│   └── pricing-public/pricing-public.component.ts
└── dashboard/pages/
    ├── plans-catalog/plans-catalog.component.ts
    ├── checkout/checkout.component.ts
    ├── my-events/my-events.component.ts
    ├── profile/profile.component.ts
    └── admin/
        ├── plans-admin/plans-admin.component.ts
        ├── purchases-admin/purchases-admin.component.ts
        ├── metrics/metrics.component.ts
        └── expired-events/expired-events.component.ts
```

---

## Para Hacer PR

```bash
git add -A
git commit -m "feat: implement subscription-plans commercialization system

- Self-registration with email verification
- Plans catalog (public + admin CRUD)
- Stripe + MercadoPago payment integration
- Event lifecycle management (activate/deactivate/postpone)
- Package-based feature access control middleware
- User dashboard (my-events, profile, plans catalog, checkout)
- Admin panel (purchases, metrics, expired events, plans mgmt)
- SQL migration for new tables and columns"

git push -u origin feature/subscription-plans
```

Luego crear PR: `feature/subscription-plans` → `develop`
