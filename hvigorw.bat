@rem ----------------------------------------------------------------------------
@rem Hvigor Startup Script for Windows
@rem ----------------------------------------------------------------------------

@setlocal

@set DEFAULT_HVIGOR_VERSION=4.0.2
@set HVIGOR_APP_HOME_DIR=%~dp0

@rem Find node.exe
@set NODE_EXE=node
@where node >nul 2>nul
@if %ERRORLEVEL% equ 0 goto execute

@echo ERROR: Node.js is not found in PATH.
@echo Please install Node.js and add it to PATH.
@exit /b 1

:execute
@rem Execute Hvigor
@"%NODE_EXE%" "%HVIGOR_APP_HOME_DIR%hvigor\hvigor-wrapper.js" %*

@endlocal
