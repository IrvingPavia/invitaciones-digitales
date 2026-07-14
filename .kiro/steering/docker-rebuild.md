---
inclusion: auto
---

# Docker Rebuild — Reglas de desarrollo local

Este proyecto corre en Docker localmente. Después de cualquier cambio en el código fuente (frontend o backend), se deben reconstruir las imágenes Docker para que los cambios se reflejen en el navegador.

## Reglas para el agente

1. **Después de terminar cambios de código**, ejecutar automáticamente el rebuild de Docker sin que el usuario lo pida.
2. **Comando**: `docker-compose up -d --build --force-recreate frontend backend` (o solo `frontend` / `backend` según lo que cambió).
3. **Directorio**: `c:\Portafolio\invitaciones-digitales`
4. **No mostrar outputs intermedios** del build. Solo confirmar cuando terminó con un mensaje breve como "Docker rebuild listo. Ctrl+Shift+R en el navegador."
5. Si solo cambió el frontend, reconstruir solo `frontend`. Si cambió el backend, incluir `backend`. Si ambos, ambos.
