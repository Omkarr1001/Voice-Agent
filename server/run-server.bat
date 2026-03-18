@echo off
REM Run Zepmed chat proxy so text chat uses your ZepMed Agent (same as dashboard).
REM Get your PRIVATE key from https://dashboard.vapi.ai (API Keys). Do not use the public key here.
if "%VAPI_API_KEY%"=="" (
  echo Set your private API key first, e.g.:
  echo   set VAPI_API_KEY=your_private_key_here
  echo Then run this script again.
  pause
  exit /b 1
)
if "%VAPI_ASSISTANT_ID%"=="" set VAPI_ASSISTANT_ID=f62ff55b-d7b6-4468-9a7d-30e2bf8338e4
node server.js
