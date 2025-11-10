@echo off
setlocal enabledelayedexpansion

REM Quick fix: renombrar 'master' a 'main' y hacer push forzado

where git >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Git no esta instalado o no esta en PATH.
  exit /b 1
)

REM Verificar que estamos en un repo git
git rev-parse --is-inside-work-tree >nul 2>nul
if errorlevel 1 (
  echo [INFO] Inicializando repositorio Git...
  git init || exit /b 1
)

REM Obtener rama actual
for /f "delims=" %%i in ('git rev-parse --abbrev-ref HEAD') do set CURR=%%i
echo [INFO] Rama actual: %CURR%

if /I "%CURR%"=="master" (
  echo [INFO] Renombrando rama 'master' a 'main'...
  git branch -m master main || exit /b 1
) else (
  if /I "%CURR%"=="HEAD" (
    echo [INFO] No hay rama actual; creando 'main'...
    git checkout -b main || exit /b 1
  )
)

REM Configurar remoto origin
set REPO_URL=https://github.com/avinilo/quepeliveo.git
git remote -v | find "origin" >nul
if errorlevel 1 (
  echo [INFO] Configurando remoto origin a %REPO_URL% ...
  git remote add origin %REPO_URL% || exit /b 1
) else (
  echo [INFO] Actualizando URL de origin a %REPO_URL% ...
  git remote set-url origin %REPO_URL% || exit /b 1
)

REM Push forzado a main
echo [INFO] Empujando a origin/main con --force ...
git push -u origin main --force
if errorlevel 1 (
  echo [WARN] Error en push. Intentando set upstream y reintentar...
  git push --set-upstream origin main --force
)
if errorlevel 1 (
  echo [ERROR] Fallo al hacer push. Verifique credenciales de GitHub.
  exit /b 1
)
echo [SUCCESS] Push completado correctamente.
endlocal