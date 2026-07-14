# 🚀 Instrucciones de Despliegue — Vitely

## Server info

- **IP**: 109.199.111.200
- **Dominio**: invitaciones.jbdev.pro
- **SSL**: Let's Encrypt (cert en `/etc/letsencrypt/live/pos.jbdev.pro/`)
- **Proyecto en server**: `~/projects/invitaciones-digitales`
- **Usuario**: pavi
- **Docker Compose**: v2 (`docker compose`, sin guión)
- **BD**: Usa MySQL del proyecto POS (`pos-mysql-1`), red `pos_default`

## Pasos de deploy

```bash
# 1. Conectar al server (Termius)
ssh pavi@109.199.111.200

# 2. Ir al proyecto
cd ~/projects/invitaciones-digitales

# 3. Respaldar docker-compose.yml del server
cp docker-compose.yml docker-compose.yml.bak

# 4. Pull cambios
git pull origin int-002

# 5. Restaurar docker-compose.yml del server
cp docker-compose.yml.bak docker-compose.yml

# 6. Rebuild y levantar
docker compose up -d --build backend frontend
```

## Puertos en producción

| Servicio | Puerto host | Puerto container |
|----------|-------------|-----------------|
| Frontend | 4200 | 80 |
| Backend | 3001 | 3000 |

## Nginx del host

Archivo: `/etc/nginx/sites-enabled/invitaciones`

Debe tener:
- `location /` → proxy a `127.0.0.1:4200`
- `location /api/` → proxy a `127.0.0.1:3001`
- `location /uploads/` → proxy a `127.0.0.1:3001/uploads/`
- `client_max_body_size 50m;`

## docker-compose.yml del server (diferencias vs repo)

El server NO usa el docker-compose.yml del repo. Diferencias:
- No tiene servicio MySQL (usa `pos-mysql-1` externo)
- Red: `pos_default` (externa)
- DB_HOST: `pos-mysql-1`
- Puertos: `4200:80` y `3001:3000`
- `depends_on: []` (sin MySQL)

**NUNCA** hacer `docker compose down -v` — elimina volúmenes con datos.

## Scripts SQL para migraciones

Ejecutar en DBeaver (conexión al server MySQL) uno por uno.
Ver archivo `docs/MIGRATIONS.md` para scripts pendientes.
