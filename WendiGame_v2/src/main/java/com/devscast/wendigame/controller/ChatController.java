package com.devscast.wendigame.controller;

import com.devscast.wendigame.model.ChatMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
public class ChatController {

    @MessageMapping("/lobby")        // reçoit les messages via /app/lobby
    @SendTo("/topic/lobby")          // rediffuse à tous les clients abonnés
    public ChatMessage handleLobby(ChatMessage message) {
        // Ajoute une date/heure au message
        message.setTimestamp(LocalDateTime.now());

        // Log simple pour le serveur
        System.out.println("💬 Message de " + message.getSender() + " : " + message.getContent());

        return message;
    }
}
