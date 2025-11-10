@echo off
setlocal EnableDelayedExpansion

REM ======================================================
REM Script: git_push_changes.bat
REM Descripcion: Comitea y sube cambios al repositorio remoto (GitHub)
REM Uso:
REM   1) git_push_changes.bat "Mensaje del commit"
REM   2) git_push_changes.bat   (usa mensaje por defecto con fecha/hora)
REM ======================================================

REM Comprobar que git está instalado
where git >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
  echo [ERROR] Git no esta instalado o no se encuentra en el PATH.
  echo         Instala Git y vuelve a intentarlo: https://git-scm.com/downloads
  exit /b 1
)

REM Comprobar que estamos en un repositorio git
git rev-parse --is-inside-work-tree >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
  echo [ERROR] Esta carpeta no es un repositorio Git.
  echo         Asegurate de ejecutar el script en la raiz del proyecto.
  exit /b 1
)

REM Obtener rama actual
set BRANCH=
for /f "usebackq tokens=* delims=" %%b in (`git rev-parse --abbrev-ref HEAD 2^>nul`) do set BRANCH=%%b
IF NOT DEFINED BRANCH (
  echo [ERROR] No se pudo determinar la rama actual.
  exit /b 1
)

REM Comprobar remoto origin
set REMOTE_URL=
for /f "usebackq tokens=* delims=" %%r in (`git remote get-url origin 2^>nul`) do set REMOTE_URL=%%r
IF NOT DEFINED REMOTE_URL (
  echo [ERROR] No se encontro el remoto 'origin'.
  echo         Configura el remoto, por ejemplo:
  echo         git remote add origin https://github.com/USUARIO/REPO.git
  exit /b 1
)

REM Preparar mensaje de commit
set MESSAGE=%*
IF "%MESSAGE%"=="" GOTO setdefaultmsg
GOTO showresume

:setdefaultmsg
for /f "tokens=1-3 delims=/ " %%a in ("%DATE%") do set FECHA=%%a-%%b-%%c
set MESSAGE=Auto: actualizar cambios - %FECHA% %TIME%

:showresume

REM Mostrar resumen
echo ----------------------------------------------
echo Rama actual: %BRANCH%
echo Remoto:      %REMOTE_URL%
echo Mensaje:     %MESSAGE%
echo ----------------------------------------------

REM Comprobar si hay cambios pendientes
set CHANGED=0
for /f "usebackq tokens=* delims=" %%s in (`git status --porcelain`) do set CHANGED=1

IF %CHANGED%==0 (
  echo [INFO] No hay cambios en el area de trabajo.
) ELSE (
  echo [INFO] Preparando commit...
  git add -A
  IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Fallo al hacer add de los cambios.
    exit /b 1
  )

  git commit -m "%MESSAGE%"
  IF %ERRORLEVEL% NEQ 0 (
    echo [WARN] No se pudo crear el commit (probablemente no hay cambios que commitear).
  )
)

REM Hacer push al remoto
echo [INFO] Subiendo cambios a origin/%BRANCH% ...
git push origin %BRANCH%
IF %ERRORLEVEL% NEQ 0 (
  echo [ERROR] Fallo al hacer push. Revisa tus credenciales o conflictos.
  echo         Sugerencia: ejecuta 'git pull --rebase' y vuelve a intentar.
  exit /b 1
)

echo [OK] Cambios subidos correctamente a %REMOTE_URL% (rama %BRANCH%).
exit /b 0