@echo off
@WHERE node >nul 2>nul
@IF %ERRORLEVEL% NEQ 0 echo [ERROR] You don't have node.js installed! Visit: https://nodejs.org/
@IF %ERRORLEVEL% NEQ 1 node assets/ShadertoyToFlixel.js
pause