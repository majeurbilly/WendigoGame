// Package api expose la couche HTTP et WebSocket du serveur : routage, handlers et hub de connexions.
//
// Rôle dans l’architecture : le « Comment » — recevoir les requêtes, valider les entrées, appeler le store
// pour la persistance, et gérer les WebSockets pour le temps réel. Les modèles (models) décrivent les données ;
// le store sait où les stocker ; ce package orchestre la communication avec les clients.
package api
