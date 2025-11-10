@echo off
setlocal enabledelayedexpansion

echo === Deploy a GitHub: quepeliveo ===

REM Verificar que Git está instalado
where git >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Git no está instalado o no está en PATH.
  echo Descarga Git: https://git-scm.com/download/win
  pause
  exit /b 1
)

REM Comprobar si el repo ya está inicializado
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
  echo Inicializando repositorio Git...
  git init || goto :fail
)

REM Asegurar rama principal 'main'
git branch -M main 2>nul

REM Asegurar .gitignore (si no existe)
if not exist ".gitignore" (
  echo Creando .gitignore por defecto...
  (
    echo node_modules
    echo dist
    echo .env
    echo .env.*
  )> .gitignore
)

REM Añadir todos los archivos respetando .gitignore
echo Añadiendo archivos...
git add . || goto :fail

REM Crear commit (inicial o de actualización)
git rev-parse --verify HEAD >nul 2>&1
if errorlevel 1 (
  echo Creando commit inicial...
  git commit -m "Initial commit" || goto :fail
) else (
  echo Creando commit de actualización...
  git commit -m "Update" || echo [INFO] No hay cambios para commitear.
)

REM Configurar remoto
set HASREMOTE=
for /f "tokens=*" %%R in ('git remote') do set HASREMOTE=1
if defined HASREMOTE (
  echo Removiendo remoto 'origin' existente...
  git remote remove origin >nul 2>&1
)

echo Agregando remoto 'origin': https://github.com/avinilo/quepeliveo.git
git remote add origin https://github.com/avinilo/quepeliveo.git || goto :fail

REM Publicar a GitHub con force
echo Publicando a GitHub (force)...
git push -u origin main --force || goto :fail

echo === Despliegue completado correctamente ===
echo Revisa: https://github.com/avinilo/quepeliveo
pause
exit /b 0

:fail
echo [ERROR] Ocurrió un error durante el despliegue.
echo - Verifica que tengas permisos sobre el repositorio.
echo - Si te pide credenciales, inicia sesión con tu cuenta o usa un Personal Access Token.
pause
exit /b 1