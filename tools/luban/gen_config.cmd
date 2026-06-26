@echo off
powershell -ExecutionPolicy Bypass -File "%~dp0gen_config.ps1" %*
