@echo off
REM ============================================
REM Exportar BD local (Docker) a archivo SQL
REM ============================================
SET CONTAINER=invitaciones-mysql
SET DB_NAME=invitaciones
SET DB_USER=root
SET DB_PASS=rootpassword
SET OUTPUT_FILE=invitaciones_backup.sql

echo Exportando base de datos "%DB_NAME%" desde contenedor "%CONTAINER%"...

docker exec %CONTAINER% mysqldump -u%DB_USER% -p%DB_PASS% --single-transaction --routines --triggers --add-drop-table %DB_NAME% > %OUTPUT_FILE%

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Exportacion exitosa: %OUTPUT_FILE%
    for %%A in (%OUTPUT_FILE%) do echo Tamano: %%~zA bytes
) else (
    echo.
    echo Error al exportar. Verifica que el contenedor este corriendo.
)

pause
