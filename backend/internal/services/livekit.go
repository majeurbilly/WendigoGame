package services

import (
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/livekit/protocol/auth"
	"github.com/majeurbilly/wendigogame/internal/models"
)

type LiveKitService struct {
	apiKey    string
	apiSecret string
}

func NewLiveKitService(apiKey, apiSecret string) (*LiveKitService, error) {
	trimmedAPIKey := strings.TrimSpace(apiKey)
	trimmedAPISecret := strings.TrimSpace(apiSecret)
	if trimmedAPIKey == "" || trimmedAPISecret == "" {
		return nil, fmt.Errorf("livekit: missing API key or secret")
	}
	return &LiveKitService{
		apiKey:    trimmedAPIKey,
		apiSecret: trimmedAPISecret,
	}, nil
}

// NewLiveKitServiceFromEnv creates the service from environment variables.
// If variables are not set, it returns nil to allow local/dev runs without LiveKit.
func NewLiveKitServiceFromEnv() (*LiveKitService, error) {
	apiKey := strings.TrimSpace(os.Getenv("LIVEKIT_API_KEY"))
	apiSecret := strings.TrimSpace(os.Getenv("LIVEKIT_API_SECRET"))
	if apiKey == "" && apiSecret == "" {
		return nil, nil
	}
	return NewLiveKitService(apiKey, apiSecret)
}

func (service *LiveKitService) GenerateToken(lobby *models.Lobby, playerID string) (string, error) {
	if service == nil {
		return "", nil
	}

	if lobby == nil {
		return "", fmt.Errorf("livekit: lobby is required")
	}

	trimmedLobbyCode := strings.TrimSpace(lobby.Code)
	trimmedPlayerID := strings.TrimSpace(playerID)
	if trimmedLobbyCode == "" || trimmedPlayerID == "" {
		return "", fmt.Errorf("livekit: lobbyCode and playerID are required")
	}

	playerName := trimmedPlayerID
	playerAlive := false
	for i := range lobby.Players {
		if lobby.Players[i].ID.String() == trimmedPlayerID {
			if strings.TrimSpace(lobby.Players[i].Name) != "" {
				playerName = strings.TrimSpace(lobby.Players[i].Name)
			}
			playerAlive = lobby.Players[i].IsAlive
			break
		}
	}

	canPublish, tokenProfile := resolveAudioPublishPolicy(lobby.Phase, playerAlive)

	grant := &auth.VideoGrant{
		RoomJoin:     true,
		Room:         trimmedLobbyCode,
		CanPublish:   boolPtr(canPublish),
		CanSubscribe: boolPtr(true),
	}

	accessToken := auth.NewAccessToken(service.apiKey, service.apiSecret)
	accessToken.SetIdentity(trimmedPlayerID)
	accessToken.SetName(playerName)
	accessToken.SetVideoGrant(grant)

	token, err := accessToken.ToJWT()
	if err != nil {
		return "", fmt.Errorf("livekit: generate token: %w", err)
	}
	log.Printf(
		"livekit: generated %s for lobby %s player %s phase=%s alive=%t can_publish=%t",
		tokenProfile,
		trimmedLobbyCode,
		trimmedPlayerID,
		lobby.Phase,
		playerAlive,
		canPublish,
	)
	return token, nil
}

func boolPtr(value bool) *bool {
	return &value
}

func resolveAudioPublishPolicy(phase models.GamePhase, playerAlive bool) (bool, string) {
	if !playerAlive {
		return false, "Council Token"
	}

	switch phase {
	case models.GamePhaseNight:
		return true, "Council Token"
	case models.GamePhaseDay, models.GamePhaseAccusation, models.GamePhasePleadings, models.GamePhaseCouncilVote:
		return true, "Council Token"
	default:
		return false, "Silent Token"
	}
}
