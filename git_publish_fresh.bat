@echo off
setlocal enabledelayedexpansion

echo === Publicar proyecto a GitHub desde cero ===

REM Configuración
set DEFAULT_REMOTE=https://github.com/avinilo/quepeliveo.git
set REMOTE_URL=

if not "%~1"=="" (
  set REMOTE_URL=%~1
) else (
  set REMOTE_URL=%DEFAULT_REMOTE%
)

echo Remoto destino: %REMOTE_URL%

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

REM Asegurar .gitignore con entradas sensibles
if not exist ".gitignore" (
  echo Creando .gitignore por defecto...
  (
    echo node_modules
    echo dist
    echo .env
    echo .env.*
    echo .vercel/
  )> .gitignore
) else (
  REM Añadir entradas si faltan
  findstr /C:".env" .gitignore >nul 2>&1 || echo .env>> .gitignore
  findstr /C:".env.*" .gitignore >nul 2>&1 || echo .env.*>> .gitignore
  findstr /C:"node_modules" .gitignore >nul 2>&1 || echo node_modules>> .gitignore
  findstr /C:"dist" .gitignore >nul 2>&1 || echo dist>> .gitignore
)

REM Añadir todos los archivos respetando .gitignore
echo Añadiendo archivos...
git add . || goto :fail

REM Crear commit (inicial o de actualización)
git rev-parse --verify HEAD >nul 2>&1
if errorlevel 1 (
  echo Creando commit inicial...
  git commit -m "Initial publish" || goto :fail
) else (
  echo Creando commit de actualización...
  git commit -m "Publish from fresh state" || echo [INFO] No hay cambios para commitear.
)

REM Configurar remoto 'origin'
for /f "tokens=*" %%R in ('git remote') do set HASREMOTE=1
if defined HASREMOTE (
  echo Removiendo remoto 'origin' existente...
  git remote remove origin >nul 2>&1
)

echo Agregando remoto 'origin': %REMOTE_URL%
git remote add origin %REMOTE_URL% || goto :fail

REM Publicar a GitHub
echo Publicando a GitHub...
git push -u origin main || goto :fail

echo === Publicación completada correctamente ===
echo Revisa: %REMOTE_URL%
pause
exit /b 0

:fail
echo [ERROR] Ocurrió un error durante la publicación.
echo - Verifica que el remoto exista y tengas permisos de escritura.
echo - Si te pide credenciales, inicia sesión con tu cuenta o usa un Personal Access Token.
echo - Si el remoto no existe, crea el repositorio vacío en GitHub y vuelve a ejecutar el script.
pause
exit /b 1