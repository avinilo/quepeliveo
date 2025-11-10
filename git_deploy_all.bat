@echo off
setlocal enabledelayedexpansion

REM Deploy completo: asegura rama main, remoto origin y push

where git >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Git no esta instalado o no esta en PATH.
  exit /b 1
)

REM Inicializar repo si es necesario
git rev-parse --is-inside-work-tree >nul 2>nul
if errorlevel 1 (
  echo [INFO] Inicializando repositorio Git...
  git init || exit /b 1
)

REM Asegurar .gitignore minimo si no existe
if not exist .gitignore (
  echo node_modules/>.gitignore
  echo dist/>>.gitignore
  echo .DS_Store>>.gitignore
  echo thumbs.db>>.gitignore
)

REM Detectar rama actual
for /f "delims=" %%i in ('git rev-parse --abbrev-ref HEAD') do set CURR=%%i
echo [INFO] Rama actual: %CURR%

if /I "%CURR%"=="master" (
  echo [INFO] Renombrando 'master' a 'main'...
  git branch -m master main || exit /b 1
) else if /I "%CURR%"=="HEAD" (
  echo [INFO] No hay rama; creando 'main'...
  git checkout -b main || exit /b 1
)

REM Asegurar que hay al menos un commit
git rev-parse --verify HEAD >nul 2>nul
if errorlevel 1 (
  echo [INFO] Realizando commit inicial...
  git add -A || exit /b 1
  git commit -m "Initial commit" || exit /b 1
)

REM Configurar remoto
set REPO_URL=https://github.com/avinilo/quepeliveo.git
git remote -v | find "origin" >nul
if errorlevel 1 (
  echo [INFO] Configurando origin a %REPO_URL% ...
  git remote add origin %REPO_URL% || exit /b 1
) else (
  echo [INFO] Actualizando URL de origin a %REPO_URL% ...
  git remote set-url origin %REPO_URL% || exit /b 1
)

REM Establecer upstream y push
echo [INFO] Empujando a origin/main con upstream y --force...
git push --set-upstream origin main --force
if errorlevel 1 (
  echo [WARN] Primer intento fallido; reintentando con -u...
  git push -u origin main --force
)
if errorlevel 1 (
  echo [ERROR] Fallo al hacer push. Verifique credenciales de GitHub.
  exit /b 1
)

echo [SUCCESS] Deploy completado correctamente.
endlocal