# Script de demarrage automatique pour Wendigo Game
Write-Host "Demarrage de Wendigo Game..." -ForegroundColor Green

# Demarrer le Backend
Write-Host "Demarrage du Backend (.NET API)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-Command", "cd 'backend\Wendigame.API'; dotnet run --urls 'http://localhost:5000'"

# Attendre 10 secondes pour que le backend demarre
Write-Host "Attente du demarrage du backend..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Demarrer le Frontend
Write-Host "Demarrage du Frontend Web (React)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-Command", "cd 'frontend\web'; npm start"

# Attendre 5 secondes pour que le frontend demarre
Write-Host "Attente du demarrage du frontend..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Ouvrir les URLs dans le navigateur
Write-Host "Ouverture des URLs..." -ForegroundColor Green
Start-Process "http://localhost:5000/swagger"
Start-Process "http://localhost:3000"

Write-Host "Wendigo Game est en cours de demarrage !" -ForegroundColor Green
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Swagger: http://localhost:5000/swagger" -ForegroundColor Cyan
Write-Host "Utilisez Ctrl+C dans les terminaux pour arreter les services" -ForegroundColor Yellow
