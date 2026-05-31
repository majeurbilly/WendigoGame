package api_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/alicebob/miniredis/v2"
	"github.com/google/uuid"
	"github.com/majeurbilly/wendigogame/internal/api"
	"github.com/majeurbilly/wendigogame/internal/auth"
	"github.com/majeurbilly/wendigogame/internal/database"
	"github.com/majeurbilly/wendigogame/internal/models"
	"github.com/majeurbilly/wendigogame/internal/store"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

func newGameTestRouter(t *testing.T) (*store.Store, http.Handler) {
	t.Helper()
	miniredisServer := miniredis.RunT(t)
	redisClient := redis.NewClient(&redis.Options{Addr: miniredisServer.Addr()})
	t.Cleanup(func() { _ = redisClient.Close() })
	lobbyStore := store.NewForTesting(redisClient)
	connectionHub := api.NewHub(lobbyStore)
	return lobbyStore, api.NewRouter(api.Config{Store: lobbyStore, Hub: connectionHub})
}

func newGameTestRouterWithPostgresUserStore(t *testing.T) (*store.Store, http.Handler, *pgxpool.Pool) {
	t.Helper()

	connString := strings.TrimSpace(os.Getenv("DATABASE_URL"))
	if connString == "" {
		t.Skip("DATABASE_URL is not set; skipping Postgres integration test")
	}

	dbPool, err := database.InitDB(connString)
	if err != nil {
		t.Skipf("unable to connect to Postgres test database: %v", err)
	}
	t.Cleanup(dbPool.Close)

	ctx := context.Background()
	if err := database.MigrateSchema(ctx, dbPool); err != nil {
		t.Fatalf("MigrateSchema: %v", err)
	}
	_, _ = dbPool.Exec(ctx, "TRUNCATE TABLE game_participants, game_history, users RESTART IDENTITY CASCADE")
	t.Cleanup(func() {
		_, _ = dbPool.Exec(context.Background(), "TRUNCATE TABLE game_participants, game_history, users RESTART IDENTITY CASCADE")
	})

	miniredisServer := miniredis.RunT(t)
	redisClient := redis.NewClient(&redis.Options{Addr: miniredisServer.Addr()})
	t.Cleanup(func() { _ = redisClient.Close() })

	lobbyStore := store.NewForTesting(redisClient)
	userStore := database.NewUserStore(dbPool)
	connectionHub := api.NewHub(lobbyStore)
	handler := api.NewRouter(api.Config{Store: lobbyStore, UserStore: userStore, Hub: connectionHub})
	return lobbyStore, handler, dbPool
}

func TestStartGame_OKUpdatesPhaseInValkey(t *testing.T) {
	st, handler := newGameTestRouter(t)
	ctx := context.Background()

	hostUUID := uuid.New()
	createBody := `{"mode":"local","host_name":"Alice"}`
	createReq := httptest.NewRequest(http.MethodPost, "/lobbies", strings.NewReader(createBody))
	createReq.Header.Set("Content-Type", "application/json")
	createReq.Header.Set("Authorization", "Bearer "+auth.MustTestAccessToken(hostUUID))
	createRec := httptest.NewRecorder()
	handler.ServeHTTP(createRec, createReq)
	if createRec.Code != http.StatusCreated {
		t.Fatalf("CreateLobby HTTP: status %d, body %q", createRec.Code, createRec.Body.String())
	}
	var created models.Lobby
	if err := json.Unmarshal(createRec.Body.Bytes(), &created); err != nil {
		t.Fatalf("JSON lobby: %v", err)
	}
	if len(created.Players) != 1 {
		t.Fatalf("players: %+v", created.Players)
	}
	hostID := created.Players[0].ID
	code := created.Code

	startReq := httptest.NewRequest(http.MethodPost, "/lobbies/"+code+"/start", nil)
	startReq.Header.Set("X-Player-ID", hostID.String())
	startRec := httptest.NewRecorder()
	handler.ServeHTTP(startRec, startReq)
	if startRec.Code != http.StatusOK {
		t.Fatalf("StartGame HTTP: status %d, body %q", startRec.Code, startRec.Body.String())
	}

	got, err := st.GetLobby(ctx, code)
	if err != nil {
		t.Fatalf("GetLobby: %v", err)
	}
	if got.Phase != models.GamePhaseChairSelection {
		t.Fatalf("Valkey phase: got %q, want %q", got.Phase, models.GamePhaseChairSelection)
	}
	if got.TimeRemaining != 10 {
		t.Fatalf("time_remaining: got %d, want 10", got.TimeRemaining)
	}
	wendigo := 0
	villager := 0
	for _, p := range got.Players {
		switch strings.ToUpper(strings.TrimSpace(p.Role)) {
		case "WENDIGO":
			wendigo++
		case "VILLAGER":
			villager++
		}
	}
	if wendigo != 1 || villager != len(got.Players)-1 {
		t.Fatalf("roles: want 1 WENDIGO and %d VILLAGER, got wendigo=%d villager=%d players=%+v", len(got.Players)-1, wendigo, villager, got.Players)
	}
}

func TestStartGame_WrongHostForbidden(t *testing.T) {
	_, handler := newGameTestRouter(t)

	hostUUID := uuid.New()
	createBody := `{"mode":"local","host_name":"Bob"}`
	createReq := httptest.NewRequest(http.MethodPost, "/lobbies", strings.NewReader(createBody))
	createReq.Header.Set("Content-Type", "application/json")
	createReq.Header.Set("Authorization", "Bearer "+auth.MustTestAccessToken(hostUUID))
	createRec := httptest.NewRecorder()
	handler.ServeHTTP(createRec, createReq)
	if createRec.Code != http.StatusCreated {
		t.Fatalf("CreateLobby: %d", createRec.Code)
	}
	var created models.Lobby
	if err := json.Unmarshal(createRec.Body.Bytes(), &created); err != nil {
		t.Fatalf("JSON: %v", err)
	}
	code := created.Code

	startReq := httptest.NewRequest(http.MethodPost, "/lobbies/"+code+"/start", nil)
	startReq.Header.Set("X-Player-ID", "not-the-host-id")
	startRec := httptest.NewRecorder()
	handler.ServeHTTP(startRec, startReq)
	if startRec.Code != http.StatusForbidden {
		t.Fatalf("wrong host: status %d, body %q", startRec.Code, startRec.Body.String())
	}
}

func TestCreateLobby_WithJWT_UsesAuthenticatedUserIDAsHost(t *testing.T) {
	_, handler := newGameTestRouter(t)
	fixedUserID := uuid.MustParse("11111111-1111-1111-1111-111111111111")
	token := auth.MustTestAccessToken(fixedUserID)

	// Keep host_name explicit here because this test router has no UserStore.
	// The behavior under test is ID mapping (JWT user ID -> lobby host player ID).
	createBody := `{"mode":"online","host_name":"jwt-host"}`
	createReq := httptest.NewRequest(http.MethodPost, "/lobbies", strings.NewReader(createBody))
	createReq.Header.Set("Content-Type", "application/json")
	createReq.Header.Set("Authorization", "Bearer "+token)
	createRec := httptest.NewRecorder()

	handler.ServeHTTP(createRec, createReq)
	if createRec.Code != http.StatusCreated && createRec.Code != http.StatusOK {
		t.Fatalf("CreateLobby HTTP: status %d, body %q", createRec.Code, createRec.Body.String())
	}

	var created models.Lobby
	if err := json.Unmarshal(createRec.Body.Bytes(), &created); err != nil {
		t.Fatalf("JSON lobby: %v", err)
	}
	if len(created.Players) == 0 {
		t.Fatalf("expected at least one player, got 0: %+v", created)
	}
	if created.Players[0].ID != fixedUserID {
		t.Fatalf("host id mismatch: got %s, want %s", created.Players[0].ID, fixedUserID)
	}
}

func TestCreateLobby_WithJWT_FallbackToDBHostName(t *testing.T) {
	_, handler, dbPool := newGameTestRouterWithPostgresUserStore(t)
	ctx := context.Background()

	fixedUserID := uuid.MustParse("22222222-2222-2222-2222-222222222222")
	const expectedUsername = "WendigoMaster"
	const expectedEmail = "wendigo.master@example.com"

	_, err := dbPool.Exec(ctx, `
		INSERT INTO users (id, username, email, password_hash)
		VALUES ($1, $2, $3, 'legacy-placeholder')
	`, fixedUserID, expectedUsername, expectedEmail)
	if err != nil {
		t.Fatalf("insert users fixture: %v", err)
	}

	token := auth.MustTestAccessToken(fixedUserID)

	// host_name intentionally omitted to validate backend fallback via UserStore (Postgres).
	createReq := httptest.NewRequest(http.MethodPost, "/lobbies", strings.NewReader(`{"mode":"online"}`))
	createReq.Header.Set("Content-Type", "application/json")
	createReq.Header.Set("Authorization", "Bearer "+token)
	createRec := httptest.NewRecorder()

	handler.ServeHTTP(createRec, createReq)
	if createRec.Code != http.StatusCreated && createRec.Code != http.StatusOK {
		t.Fatalf("CreateLobby HTTP: status %d, body %q", createRec.Code, createRec.Body.String())
	}

	var created models.Lobby
	if err := json.Unmarshal(createRec.Body.Bytes(), &created); err != nil {
		t.Fatalf("JSON lobby: %v", err)
	}
	if len(created.Players) == 0 {
		t.Fatalf("expected at least one player, got 0: %+v", created)
	}
	if created.Players[0].ID != fixedUserID {
		t.Fatalf("host id mismatch: got %s, want %s", created.Players[0].ID, fixedUserID)
	}
	if created.Players[0].Name != expectedUsername {
		t.Fatalf("host name fallback mismatch: got %q, want %q", created.Players[0].Name, expectedUsername)
	}
}

func TestCreateLobby_OIDCUpsertCreatesUserAndUsesPreferredUsername(t *testing.T) {
	_, handler, dbPool := newGameTestRouterWithPostgresUserStore(t)
	ctx := context.Background()

	fixedUserID := uuid.MustParse("33333333-3333-3333-3333-333333333333")
	const wantName = "AuthentikHost"
	const wantEmail = "authentik.host@example.com"
	token := auth.MustTestAccessTokenWithOIDCClaims(fixedUserID, wantName, wantEmail)

	createReq := httptest.NewRequest(http.MethodPost, "/lobbies", strings.NewReader(`{"mode":"online"}`))
	createReq.Header.Set("Content-Type", "application/json")
	createReq.Header.Set("Authorization", "Bearer "+token)
	createRec := httptest.NewRecorder()
	handler.ServeHTTP(createRec, createReq)
	if createRec.Code != http.StatusCreated && createRec.Code != http.StatusOK {
		t.Fatalf("CreateLobby HTTP: status %d, body %q", createRec.Code, createRec.Body.String())
	}

	var created models.Lobby
	if err := json.Unmarshal(createRec.Body.Bytes(), &created); err != nil {
		t.Fatalf("JSON lobby: %v", err)
	}
	if len(created.Players) == 0 {
		t.Fatalf("expected at least one player, got 0: %+v", created)
	}
	if created.Players[0].ID != fixedUserID {
		t.Fatalf("host id mismatch: got %s, want %s", created.Players[0].ID, fixedUserID)
	}
	if created.Players[0].Name != wantName {
		t.Fatalf("host name: got %q, want %q", created.Players[0].Name, wantName)
	}

	userStore := database.NewUserStore(dbPool)
	u, err := userStore.GetUserByID(ctx, fixedUserID)
	if err != nil {
		t.Fatalf("GetUserByID after upsert: %v", err)
	}
	if u.Username != wantName {
		t.Fatalf("db username: got %q, want %q", u.Username, wantName)
	}
	if u.Email != wantEmail {
		t.Fatalf("db email: got %q, want %q", u.Email, wantEmail)
	}
}
