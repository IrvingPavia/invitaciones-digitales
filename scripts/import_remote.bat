@echo off
REM ============================================
REM Importar BD en servidor remoto
REM ============================================
REM Ajusta estas variables con los datos de tu servidor:
SET REMOTE_HOST=TU_HOST_REMOTO
SET REMOTE_PORT=3306
SET REMOTE_DB=invitaciones
SET REMOTE_USER=TU_USUARIO
SET REMOTE_PASS=TU_PASSWORD
SET INPUT_FILE=invitaciones_backup.sql

echo Importando "%INPUT_FILE%" en %REMOTE_HOST%:%REMOTE_PORT%/%REMOTE_DB%...

mysql -h %REMOTE_HOST% -P %REMOTE_PORT% -u%REMOTE_USER% -p%REMOTE_PASS% %REMOTE_DB% < %INPUT_FILE%

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Importacion exitosa en %REMOTE_HOST%
) else (
    echo.
    echo Error al importar. Verifica credenciales y conectividad.
)

pause
