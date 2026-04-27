package services

import (
	"fmt"
	"os"
	"strings"

	"github.com/livekit/protocol/auth"
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

func (service *LiveKitService) GenerateToken(lobbyCode string, playerID string, playerName string) (string, error) {
	if service == nil {
		return "", nil
	}

	trimmedLobbyCode := strings.TrimSpace(lobbyCode)
	trimmedPlayerID := strings.TrimSpace(playerID)
	trimmedPlayerName := strings.TrimSpace(playerName)
	if trimmedLobbyCode == "" || trimmedPlayerID == "" {
		return "", fmt.Errorf("livekit: lobbyCode and playerID are required")
	}
	if trimmedPlayerName == "" {
		trimmedPlayerName = trimmedPlayerID
	}

	grant := &auth.VideoGrant{
		RoomJoin:     true,
		Room:         trimmedLobbyCode,
		CanPublish:   boolPtr(true),
		CanSubscribe: boolPtr(true),
	}

	accessToken := auth.NewAccessToken(service.apiKey, service.apiSecret)
	accessToken.SetIdentity(trimmedPlayerID)
	accessToken.SetName(trimmedPlayerName)
	accessToken.AddGrant(grant)

	token, err := accessToken.ToJWT()
	if err != nil {
		return "", fmt.Errorf("livekit: generate token: %w", err)
	}
	return token, nil
}

func boolPtr(value bool) *bool {
	return &value
}
