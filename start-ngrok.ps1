# Ngrok Hosting Script for Fuji Card Market
# This script starts both servers and ngrok tunnels

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  Fuji Card Market - Ngrok Hosting Setup" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Check if servers are already running
Write-Host "Checking server status..." -ForegroundColor Yellow

# Start Backend Server (if not running)
Write-Host "`n[1/3] Starting Backend Server on port 5000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\server'; node index.js" -WindowStyle Normal

Start-Sleep -Seconds 3

# Start Frontend Server (if not running)  
Write-Host "[2/3] Starting Frontend Server on port 5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\client'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 5

# Start Ngrok Tunnel
Write-Host "[3/3] Starting Ngrok Tunnel..." -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: Ngrok will start in a new window." -ForegroundColor Yellow
Write-Host "Copy the HTTPS URL from the ngrok window!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to continue after ngrok starts..." -ForegroundColor Yellow

Start-Process powershell -ArgumentList "-NoExit", "-Command", "ngrok http 5173 --host-header=`"localhost:5173`"" -WindowStyle Normal

Read-Host "Press Enter to finish setup"

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your site is now accessible via ngrok!" -ForegroundColor Green
Write-Host "Check the ngrok window for your HTTPS URL" -ForegroundColor Yellow
Write-Host ""
Write-Host "Windows:" -ForegroundColor Cyan
Write-Host "  - Backend:   http://localhost:5000" -ForegroundColor White
Write-Host "  - Frontend:  http://localhost:5173" -ForegroundColor White
Write-Host "  - Ngrok:     Check ngrok window for URL" -ForegroundColor White
Write-Host ""
Write-Host "To stop all servers, close all PowerShell windows" -ForegroundColor Red
Write-Host ""
