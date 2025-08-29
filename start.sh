#!/bin/bash

# 🐺 Wendigo Game - Script de Démarrage Rapide
# Ce script permet de démarrer rapidement l'application Wendigo Game

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_message() {
    echo -e "${GREEN}[WENDIGO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Vérifier si Docker est installé
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker n'est pas installé. Veuillez installer Docker d'abord."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose n'est pas installé. Veuillez installer Docker Compose d'abord."
        exit 1
    fi
}

# Vérifier si les ports sont disponibles
check_ports() {
    local ports=("8000" "3000" "5432")
    
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            print_warning "Le port $port est déjà utilisé. Assurez-vous qu'aucune autre instance de Wendigo Game ne tourne."
        fi
    done
}

# Démarrer avec Docker
start_docker() {
    print_message "Démarrage de Wendigo Game avec Docker..."
    
    # Vérifier si les images existent
    if [[ "$(docker images -q wendigo-backend 2> /dev/null)" == "" ]]; then
        print_info "Construction des images Docker..."
        docker-compose build
    fi
    
    # Démarrer les services
    print_info "Démarrage des services..."
    docker-compose up -d
    
    # Attendre que les services soient prêts
    print_info "Attente du démarrage des services..."
    sleep 10
    
    # Vérifier le statut des services
    print_info "Vérification du statut des services..."
    docker-compose ps
    
    print_message "🎉 Wendigo Game est maintenant démarré !"
    print_info "Frontend: http://localhost:3000"
    print_info "Backend API: http://localhost:8000"
    print_info "Documentation API: http://localhost:8000/docs"
}

# Démarrer en mode développement local
start_local() {
    print_message "Démarrage de Wendigo Game en mode développement local..."
    
    # Vérifier Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 n'est pas installé."
        exit 1
    fi
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js n'est pas installé."
        exit 1
    fi
    
    # Démarrer le backend
    print_info "Démarrage du backend..."
    cd backend
    
    # Installer les dépendances si nécessaire
    if [ ! -d "venv" ]; then
        print_info "Création de l'environnement virtuel..."
        python3 -m venv venv
    fi
    
    source venv/bin/activate
    
    # Installer les dépendances
    print_info "Installation des dépendances backend..."
    pip install -e .
    
    # Initialiser la base de données
    print_info "Initialisation de la base de données..."
    python data/initial_data.py
    
    # Démarrer le serveur backend en arrière-plan
    print_info "Démarrage du serveur backend..."
    uvicorn app.main:app --reload --host 127.0.0.1 --port 8000 &
    BACKEND_PID=$!
    
    cd ..
    
    # Démarrer le frontend
    print_info "Démarrage du frontend..."
    cd frontend
    
    # Installer les dépendances si nécessaire
    if [ ! -d "node_modules" ]; then
        print_info "Installation des dépendances frontend..."
        npm install
    fi
    
    # Démarrer le serveur frontend
    print_info "Démarrage du serveur frontend..."
    npm start &
    FRONTEND_PID=$!
    
    cd ..
    
    # Attendre un peu
    sleep 5
    
    print_message "🎉 Wendigo Game est maintenant démarré en mode développement !"
    print_info "Frontend: http://localhost:3000"
    print_info "Backend API: http://localhost:8000"
    print_info "Documentation API: http://localhost:8000/docs"
    print_warning "Appuyez sur Ctrl+C pour arrêter les serveurs"
    
    # Fonction de nettoyage
    cleanup() {
        print_info "Arrêt des serveurs..."
        kill $BACKEND_PID 2>/dev/null || true
        kill $FRONTEND_PID 2>/dev/null || true
        exit 0
    }
    
    # Capturer Ctrl+C
    trap cleanup SIGINT
    
    # Attendre indéfiniment
    wait
}

# Arrêter les services
stop_services() {
    print_message "Arrêt de Wendigo Game..."
    
    if [ -f "docker-compose.yml" ]; then
        docker-compose down
        print_message "Services Docker arrêtés."
    else
        print_warning "Fichier docker-compose.yml non trouvé."
    fi
}

# Afficher les logs
show_logs() {
    print_message "Affichage des logs..."
    
    if [ -f "docker-compose.yml" ]; then
        docker-compose logs -f
    else
        print_warning "Fichier docker-compose.yml non trouvé."
    fi
}

# Afficher l'aide
show_help() {
    echo "🐺 Wendigo Game - Script de Démarrage Rapide"
    echo ""
    echo "Usage: $0 [COMMANDE]"
    echo ""
    echo "Commandes:"
    echo "  docker     Démarrer avec Docker (recommandé)"
    echo "  local      Démarrer en mode développement local"
    echo "  stop       Arrêter les services"
    echo "  logs       Afficher les logs"
    echo "  help       Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0 docker    # Démarrer avec Docker"
    echo "  $0 local     # Démarrer en mode développement"
    echo "  $0 stop      # Arrêter les services"
}

# Menu principal
main() {
    case "${1:-help}" in
        "docker")
            check_docker
            check_ports
            start_docker
            ;;
        "local")
            check_ports
            start_local
            ;;
        "stop")
            stop_services
            ;;
        "logs")
            show_logs
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Exécuter le script principal
main "$@"
