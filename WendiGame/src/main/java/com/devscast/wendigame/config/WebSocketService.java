package com.devscast.wendigame.config;

import org.springframework.stereotype.Service;

@Service
public class WebSocketService {
    public void envoyerTous(String type, String message) {
        // 🟡 À implémenter selon ton système WebSocket
        System.out.println("🔔 Envoi WebSocket → type: " + type + ", message: " + message);
    }
}