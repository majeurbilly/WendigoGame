package com.devscast.wendigame.model;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class LobbyMessage {
    private String username;
    private String roomId; // pour les messages liés à une room précise
    private String action; // ex: "join", "leave", "ready"
}

