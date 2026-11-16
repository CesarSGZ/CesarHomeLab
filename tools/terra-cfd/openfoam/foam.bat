@echo off
rem Ejecuta una orden de OpenFOAM v2512 (build MinGW de ESI/Keysight) en la carpeta actual.
rem Uso: foam.bat blockMesh   |   foam.bat mpiexec -n 8 simpleFoam -parallel
setlocal
set "OFROOT=C:\Program Files\ESI-OpenCFD\OpenFOAM\v2512"
set "HOME=%OFROOT%\msys64\home\ofuser\OpenFOAM"
set TYPE=win64MingwDPInt32Opt
set WM_PROJECT=OpenFOAM
set WM_PROJECT_VERSION=v2512
set "WM_PROJECT_DIR=%HOME%\OpenFOAM-v2512"
set "WM_THIRD_PARTY_DIR=%HOME%\OpenFOAM-v2512\ThirdParty"
set FOAM_SIGFPE=1
set "PATH=%WM_PROJECT_DIR%\platforms\%TYPE%\bin;C:\Program Files\Microsoft MPI\Bin;%PATH%"
%*
