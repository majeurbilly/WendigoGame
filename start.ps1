# 🐺 Wendigo Game - Script de Démarrage Rapide (PowerShell)
# Ce script permet de démarrer rapidement l'application Wendigo Game sur Windows

param(
    [Parameter(Position=0)]
    [ValidateSet("docker", "local", "stop", "logs", "help")]
    [string]$Command = "help"
)

# Couleurs pour les messages
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$White = "White"

# Fonction pour afficher les messages
function Write-WendigoMessage {
    param([string]$Message)
    Write-Host "[WENDIGO] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

# Vérifier si Docker est installé
function Test-Docker {
    try {
        $null = Get-Command docker -ErrorAction Stop
        $null = Get-Command docker-compose -ErrorAction Stop
        return $true
    }
    catch {
        Write-Error "Docker ou Docker Compose n'est pas installé. Veuillez installer Docker Desktop d'abord."
        return $false
    }
}

# Vérifier si les ports sont disponibles
function Test-Ports {
    $ports = @(8000, 3000, 5432)
    
    foreach ($port in $ports) {
        $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($connection) {
            Write-Warning "Le port $port est déjà utilisé. Assurez-vous qu'aucune autre instance de Wendigo Game ne tourne."
        }
    }
}

# Démarrer avec Docker
function Start-Docker {
    Write-WendigoMessage "Démarrage de Wendigo Game avec Docker..."
    
    # Vérifier si les images existent
    $backendImage = docker images wendigo-backend --format "{{.Repository}}" 2>$null
    if (-not $backendImage) {
        Write-Info "Construction des images Docker..."
        docker-compose build
    }
    
    # Démarrer les services
    Write-Info "Démarrage des services..."
    docker-compose up -d
    
    # Attendre que les services soient prêts
    Write-Info "Attente du démarrage des services..."
    Start-Sleep -Seconds 10
    
    # Vérifier le statut des services
    Write-Info "Vérification du statut des services..."
    docker-compose ps
    
    Write-WendigoMessage "🎉 Wendigo Game est maintenant démarré !"
    Write-Info "Frontend: http://localhost:3000"
    Write-Info "Backend API: http://localhost:8000"
    Write-Info "Documentation API: http://localhost:8000/docs"
}

# Démarrer en mode développement local
function Start-Local {
    Write-WendigoMessage "Démarrage de Wendigo Game en mode développement local..."
    
    # Vérifier Python
    try {
        $null = Get-Command python -ErrorAction Stop
    }
    catch {
        Write-Error "Python n'est pas installé ou n'est pas dans le PATH."
        return
    }
    
    # Vérifier Node.js
    try {
        $null = Get-Command node -ErrorAction Stop
    }
    catch {
        Write-Error "Node.js n'est pas installé ou n'est pas dans le PATH."
        return
    }
    
    # Démarrer le backend
    Write-Info "Démarrage du backend..."
    Set-Location backend
    
    # Installer les dépendances si nécessaire
    if (-not (Test-Path "venv")) {
        Write-Info "Création de l'environnement virtuel..."
        python -m venv venv
    }
    
    # Activer l'environnement virtuel
    & ".\venv\Scripts\Activate.ps1"
    
    # Installer les dépendances
    Write-Info "Installation des dépendances backend..."
    pip install -e .
    
    # Initialiser la base de données
    Write-Info "Initialisation de la base de données..."
    python init_db.py
    
    # Démarrer le serveur backend en arrière-plan
    Write-Info "Démarrage du serveur backend..."
    Start-Process -FilePath "python" -ArgumentList "-m", "uvicorn", "app.main:app", "--reload", "--host", "127.0.0.1", "--port", "8000" -WindowStyle Hidden
    
    Set-Location ..
    
    # Démarrer le frontend
    Write-Info "Démarrage du frontend..."
    Set-Location frontend
    
    # Installer les dépendances si nécessaire
    if (-not (Test-Path "node_modules")) {
        Write-Info "Installation des dépendances frontend..."
        npm install
    }
    
    # Démarrer le serveur frontend
    Write-Info "Démarrage du serveur frontend..."
    Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Hidden
    
    Set-Location ..
    
    # Attendre un peu
    Start-Sleep -Seconds 5
    
    Write-WendigoMessage "🎉 Wendigo Game est maintenant démarré en mode développement !"
    Write-Info "Frontend: http://localhost:3000"
    Write-Info "Backend API: http://localhost:8000"
    Write-Info "Documentation API: http://localhost:8000/docs"
    Write-Warning "Les serveurs tournent en arrière-plan. Utilisez 'Get-Process' pour voir les processus."
}

# Arrêter les services
function Stop-Services {
    Write-WendigoMessage "Arrêt de Wendigo Game..."
    
    if (Test-Path "docker-compose.yml") {
        docker-compose down
        Write-WendigoMessage "Services Docker arrêtés."
    }
    else {
        Write-Warning "Fichier docker-compose.yml non trouvé."
    }
    
    # Arrêter les processus Python et Node.js
    $pythonProcesses = Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -eq "python" }
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -eq "node" }
    
    if ($pythonProcesses) {
        Write-Info "Arrêt des processus Python..."
        $pythonProcesses | Stop-Process -Force
    }
    
    if ($nodeProcesses) {
        Write-Info "Arrêt des processus Node.js..."
        $nodeProcesses | Stop-Process -Force
    }
}

# Afficher les logs
function Show-Logs {
    Write-WendigoMessage "Affichage des logs..."
    
    if (Test-Path "docker-compose.yml") {
        docker-compose logs -f
    }
    else {
        Write-Warning "Fichier docker-compose.yml non trouvé."
    }
}

# Afficher l'aide
function Show-Help {
    Write-Host "🐺 Wendigo Game - Script de Démarrage Rapide (PowerShell)" -ForegroundColor $White
    Write-Host ""
    Write-Host "Usage: .\start.ps1 [COMMANDE]" -ForegroundColor $White
    Write-Host ""
    Write-Host "Commandes:" -ForegroundColor $White
    Write-Host "  docker     Démarrer avec Docker (recommandé)" -ForegroundColor $White
    Write-Host "  local      Démarrer en mode développement local" -ForegroundColor $White
    Write-Host "  stop       Arrêter les services" -ForegroundColor $White
    Write-Host "  logs       Afficher les logs" -ForegroundColor $White
    Write-Host "  help       Afficher cette aide" -ForegroundColor $White
    Write-Host ""
    Write-Host "Exemples:" -ForegroundColor $White
    Write-Host "  .\start.ps1 docker    # Démarrer avec Docker" -ForegroundColor $White
    Write-Host "  .\start.ps1 local     # Démarrer en mode développement" -ForegroundColor $White
    Write-Host "  .\start.ps1 stop      # Arrêter les services" -ForegroundColor $White
}

# Menu principal
switch ($Command) {
    "docker" {
        if (Test-Docker) {
            Test-Ports
            Start-Docker
        }
    }
    "local" {
        Test-Ports
        Start-Local
    }
    "stop" {
        Stop-Services
    }
    "logs" {
        Show-Logs
    }
    "help" {
        Show-Help
    }
    default {
        Show-Help
    }
}
