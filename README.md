erDiagram
  PLAYER {
    string Id
    string Name
    string UserId
    string GameId
    string ConnectionId
    bool   IsConnected
    bool   IsAlive
    bool   IsReady
    int    SelectedChair
    string Color
    datetime CreatedAt
    datetime UpdatedAt
  }

  GAME {
    string Id
    string Name
    string LobbyId
    int    NbTurn
    string Status
    string CurrentPhase
    datetime PhaseStartTime
    timespan PhaseDuration
    datetime CreatedAt
    datetime UpdatedAt
    datetime StartedAt
    datetime EndedAt
    string WinnerTeam
  }

  LOBBY {
    string Id
    string Name
    string Description
    int    MinPlayers
    int    MaxPlayers
    string CreatorId
    string Password
    string GameId
    string Status
    datetime CreatedAt
    datetime UpdatedAt
    datetime GameStartedAt
  }

  LOBBY_PLAYER {
    string Id
    string UserId
    string Name
    string LobbyId
    bool   IsReady
    datetime JoinedAt
    datetime UpdatedAt
  }

  LOBBY_MESSAGE {
    string Id
    string LobbyId
    string UserId
    string PlayerName
    string Content
    bool   IsSystemMessage
    datetime Timestamp
  }

  VOTE {
    string Id
    string GameId
    string VoterId
    string TargetPlayerId
    string VoteType
    datetime Timestamp
  }

  PLAYER_ACTION {
    string Id
    string PlayerId
    string ActionType
    string TargetPlayerId
    json   Data
    datetime Timestamp
  }

  GAME_MESSAGE {
    string Id
    string GameId
    string PlayerId
    string Content
    string MessageType
    datetime Timestamp
  }

  PLAYER_NOTE {
    string Id
    string PlayerId
    string TargetPlayerId
    string Content
    datetime CreatedAt
    datetime UpdatedAt
  }

  GAME_EVENT {
    string Id
    string GameId
    string EventType
    string PlayerId
    string TargetPlayerId
    string Description
    json   Data
    datetime Timestamp
  }

  DISPLAY_MESSAGE {
    string Id
    string Content
    string Type
    datetime Timestamp
  }

  %% Relations (uniquement les FKs réellement configurées dans EF)
  PLAYER       ||--o{ VOTE           : "casts"
  PLAYER       ||--o{ PLAYER_ACTION  : "performs"
  PLAYER       ||--o{ GAME_MESSAGE   : "sends"
  PLAYER       ||--o{ PLAYER_NOTE    : "writes"

  GAME         ||--o{ GAME_EVENT     : "has"
  GAME         ||--o{ GAME_MESSAGE   : "has"

  LOBBY        ||--o{ LOBBY_PLAYER   : "contains"
  LOBBY        ||--o{ LOBBY_MESSAGE  : "has"
