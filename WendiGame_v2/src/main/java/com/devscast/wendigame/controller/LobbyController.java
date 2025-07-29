package com.devscast.wendigame.controller;

import com.devscast.wendigame.model.LobbyMessage;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.*;

@Controller
public class LobbyController {

    private final Map<String, Set<String>> roomPlayers = new HashMap<>();

    @MessageMapping("/lobby/{roomId}")
    @SendTo("/topic/lobby/{roomId}")
    public List<String> joinRoom(@DestinationVariable String roomId, @RequestBody LobbyMessage message) {
        String username = message.getUsername();
        roomPlayers.computeIfAbsent(roomId, k -> new HashSet<>()).add(username);
        System.out.println("✅ " + username + " a rejoint la room " + roomId);
        return new ArrayList<>(roomPlayers.get(roomId));
    }

    @MessageMapping("/leave/{roomId}")
    @SendTo("/topic/lobby/{roomId}")
    public List<String> leaveRoom(@DestinationVariable String roomId, @RequestBody LobbyMessage message) {
        String username = message.getUsername();
        Set<String> players = roomPlayers.get(roomId);
        if (players != null) {
            players.remove(username);
            System.out.println("🚪 " + username + " a quitté la room " + roomId);
        }
        return players != null ? new ArrayList<>(players) : new ArrayList<>();
    }
}
