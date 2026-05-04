package store

import (
	"context"
	"encoding/json"
	"strings"
	"sync"
	"time"

	"github.com/redis/go-redis/v9"

	"github.com/majeurbilly/wendigogame/internal/models"
)

// Last player removal (e.g. explicit LEAVE_LOBBY) schedules delayed Redis delete. In dev, React Strict Mode or simultaneous
// tab reconnects can drop all sockets within milliseconds; immediate Redis DEL then
// breaks the next handshake ("lobby not found"). We delay deletion until the lobby stays
// empty for emptyLobbyGracePeriod.
const emptyLobbyGracePeriod = 12 * time.Second

var (
	emptyLobbyDeleteMu     sync.Mutex
	emptyLobbyDeleteTimers = make(map[string]*time.Timer)
)

func cancelDelayedLobbyDeletion(code string) {
	code = strings.ToUpper(strings.TrimSpace(code))
	if len(code) != 4 {
		return
	}
	emptyLobbyDeleteMu.Lock()
	defer emptyLobbyDeleteMu.Unlock()
	if t, ok := emptyLobbyDeleteTimers[code]; ok {
		t.Stop()
		delete(emptyLobbyDeleteTimers, code)
	}
}

func scheduleDelayedLobbyDeletion(s *Store, code string) {
	if s == nil || s.redisClient == nil {
		return
	}
	code = strings.ToUpper(strings.TrimSpace(code))
	if len(code) != 4 {
		return
	}
	emptyLobbyDeleteMu.Lock()
	if existing, ok := emptyLobbyDeleteTimers[code]; ok {
		existing.Stop()
		delete(emptyLobbyDeleteTimers, code)
	}
	st := s
	timer := time.AfterFunc(emptyLobbyGracePeriod, func() {
		emptyLobbyDeleteMu.Lock()
		delete(emptyLobbyDeleteTimers, code)
		emptyLobbyDeleteMu.Unlock()

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := st.deleteLobbyFromRedisIfStillEmpty(ctx, code); err != nil && err != redis.Nil {
			// Non-fatal; key may have been removed or repopulated.
			_ = err
		}
	})
	emptyLobbyDeleteTimers[code] = timer
	emptyLobbyDeleteMu.Unlock()
}

func (s *Store) deleteLobbyFromRedisIfStillEmpty(ctx context.Context, code string) error {
	key := lobbyKey(code)
	for range maxLobbyTxRetries {
		err := s.redisClient.Watch(ctx, func(tx *redis.Tx) error {
			raw, err := tx.Get(ctx, key).Result()
			if err == redis.Nil {
				return nil
			}
			if err != nil {
				return err
			}
			var lobby models.Lobby
			if err := json.Unmarshal([]byte(raw), &lobby); err != nil {
				return err
			}
			if len(lobby.Players) > 0 {
				return nil
			}
			_, err = tx.TxPipelined(ctx, func(pipe redis.Pipeliner) error {
				pipe.Del(ctx, key)
				return nil
			})
			return err
		}, key)
		if err == nil {
			return nil
		}
		if err == redis.TxFailedErr {
			continue
		}
		return err
	}
	return nil
}
