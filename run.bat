@echo off
WHERE node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
	echo [ERROR] You don't have node.js installed! Visit: https://nodejs.org/
) else (
	cd desktop
	if not exist node_modules/node-file-dialog/package.json (
		npm install >nul
	)
	call run.bat
)
pause