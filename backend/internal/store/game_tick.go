package store

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"

	"github.com/majeurbilly/wendigogame/internal/models"
)

// ProcessGameTick applies one second of game time to the lobby (read/write under WATCH).
// It returns continueLoop=false if the lobby no longer exists, if the phase is LOBBY (or empty), or on Redis errors.
// It returns continueLoop=true after a successful write (phase different from LOBBY).
func (s *Store) ProcessGameTick(ctx context.Context, code string) (continueLoop bool, err error) {
	code = strings.ToUpper(strings.TrimSpace(code))
	if len(code) != 4 {
		return false, nil
	}
	key := lobbyKey(code)
	for range maxLobbyTxRetries {
		var keepGoing bool
		var shouldPersistOutcome bool
		var finishedLobbySnapshot models.Lobby
		watchErr := s.redisClient.Watch(ctx, func(tx *redis.Tx) error {
			keepGoing = false
			raw, err := tx.Get(ctx, key).Result()
			if err == redis.Nil {
				return nil
			}
			if err != nil {
				return err
			}
			var lobby models.Lobby
			if err := json.Unmarshal([]byte(raw), &lobby); err != nil {
				return fmt.Errorf("unmarshal lobby: %w", err)
			}
			ensureLobbyVotes(&lobby)
			if lobby.Phase == "" {
				lobby.Phase = models.GamePhaseLobby
			}
			if lobby.Phase == models.GamePhaseLobby || lobby.Phase == models.PhaseGameOver {
				return nil
			}
			if lobby.Phase == models.GamePhaseNight {
				alivePlayers := countAlivePlayers(&lobby)
				if alivePlayers > 0 && len(lobby.NightActions) >= alivePlayers {
					lobby.TimeRemaining = 0
				}
			}

			shouldDecrementTime := true
			if lobby.Phase == models.GamePhasePleadings && !lobby.PleadingTimerStarted {
				shouldDecrementTime = false
			}
			if shouldDecrementTime {
				lobby.TimeRemaining--
			}

			dayChairRecall := false
			if lobby.Phase == models.GamePhaseDay && lobby.SocialPhaseTotalTime >= 3 {
				threshold := lobby.SocialPhaseTotalTime / 3
				if lobby.TimeRemaining == threshold && !lobby.ChairPromptTriggered {
					lobby.ChairPromptTriggered = true
					lobby.Phase = models.GamePhaseChairSelection
					lobby.TimeRemaining = models.ChairSelectionPhaseSeconds
					for i := range lobby.Players {
						if lobby.Players[i].IsAlive {
							lobby.Players[i].ChairID = models.UnseatedChair
						}
					}
					dayChairRecall = true
				}
			}

			waitingForPleadingStart := lobby.Phase == models.GamePhasePleadings && !lobby.PleadingTimerStarted
			if lobby.TimeRemaining <= 0 && !dayChairRecall && !waitingForPleadingStart {
				previousPhase := lobby.Phase

				if previousPhase == models.GamePhaseChairSelection {
					advanced := false
					if !chairSelectionPhaseComplete(&lobby) {
						if lobby.ChairPromptTriggered {
							if err := advanceFromChairSelection(&lobby); err != nil {
								return err
							}
							advanced = true
						} else {
							lobby.TimeRemaining = models.ChairSelectionPhaseSeconds
						}
					} else {
						if err := advanceFromChairSelection(&lobby); err != nil {
							return err
						}
						advanced = true
					}
					if advanced {
						lobby.Votes = make(map[string]string)
						lobby.NightActions = make(map[string]string)
						lobby.WendigoIntentions = make(map[string]string)
					}
				} else if previousPhase == models.GamePhaseAccusation && len(lobby.CouncilAccusations) > 0 {
					startPleadingsFromAccusation(&lobby)
					lobby.Votes = make(map[string]string)
					lobby.NightActions = make(map[string]string)
					lobby.WendigoIntentions = make(map[string]string)
				} else if previousPhase == models.GamePhasePleadings {
					if len(lobby.PleadingsQueue) > 0 {
						lobby.CurrentSpeakerID = lobby.PleadingsQueue[0]
						lobby.PleadingsQueue = lobby.PleadingsQueue[1:]
						lobby.PleadingTimerStarted = false
						lobby.TimeRemaining = 0
					} else {
						next, seconds := models.GetNextPhaseAndTime(models.GamePhasePleadings)
						lobby.Phase = next
						lobby.TimeRemaining = seconds
						clearPleadingsState(&lobby)
						lobby.CouncilAccusations = make(map[string]string)
						lobby.DefendantID = ""
						lobby.Votes = make(map[string]string)
						lobby.NightActions = make(map[string]string)
						lobby.WendigoIntentions = make(map[string]string)
					}
				} else if previousPhase == models.GamePhaseCouncilVote {
					applyCouncilVoteElimination(&lobby)
					lobby.DefendantID = ""
					next, seconds := models.GetNextPhaseAndTime(models.GamePhaseCouncilVote)
					lobby.Phase = next
					lobby.TimeRemaining = seconds
					if victory, winner := CheckVictoryConditions(&lobby); victory {
						lobby.Phase = models.PhaseGameOver
						lobby.WinnerTeam = winner
						lobby.TimeRemaining = 0
						shouldPersistOutcome = true
						finishedLobbySnapshot = lobby
					}
					lobby.Votes = make(map[string]string)
					lobby.NightActions = make(map[string]string)
					lobby.WendigoIntentions = make(map[string]string)
				} else {
					if previousPhase == models.GamePhaseDay && lobby.DefendantID == "" {
						lobby.DefendantID = pickDefendantAtEndOfDay(&lobby)
					}

					next, seconds := lobby.GetNextPhase()
					lobby.Phase = next
					lobby.TimeRemaining = seconds
					if lobby.Phase == models.GamePhaseDay {
						enterDaySocialSnapshot(&lobby)
					}

					if previousPhase == models.GamePhaseAccusation && next == models.GamePhaseNight {
						if lobby.DefendantID != "" {
							for playerIndex := range lobby.Players {
								if lobby.Players[playerIndex].ID.String() == lobby.DefendantID {
									lobby.Players[playerIndex].IsAlive = false
									break
								}
							}
						}
						lobby.DefendantID = ""
						if victory, winner := CheckVictoryConditions(&lobby); victory {
							lobby.Phase = models.PhaseGameOver
							lobby.WinnerTeam = winner
							lobby.TimeRemaining = 0
							shouldPersistOutcome = true
							finishedLobbySnapshot = lobby
						}
					}

					if previousPhase == models.GamePhaseNight {
						deceasedIDs, summary := ResolveNight(&lobby)
						for i := range deceasedIDs {
							for playerIndex := range lobby.Players {
								if lobby.Players[playerIndex].ID.String() == deceasedIDs[i] {
									lobby.Players[playerIndex].IsAlive = false
								}
							}
						}
						log.Printf("game tick: %s", summary)
						if victory, winner := CheckVictoryConditions(&lobby); victory {
							lobby.Phase = models.PhaseGameOver
							lobby.WinnerTeam = winner
							lobby.TimeRemaining = 0
							shouldPersistOutcome = true
							finishedLobbySnapshot = lobby
						}
					}

					lobby.Votes = make(map[string]string)
					lobby.NightActions = make(map[string]string)
					lobby.WendigoIntentions = make(map[string]string)
				}
			}

			payload, err := json.Marshal(&lobby)
			if err != nil {
				return fmt.Errorf("marshal lobby: %w", err)
			}
			_, err = tx.TxPipelined(ctx, func(pipe redis.Pipeliner) error {
				pipe.Set(ctx, key, payload, lobbyTTL)
				return nil
			})
			if err != nil {
				return err
			}
			keepGoing = true
			return nil
		}, key)
		if watchErr == nil {
			if shouldPersistOutcome && s.userStore != nil {
				snapshot := finishedLobbySnapshot
				go func() {
					persistCtx, cancelPersist := context.WithTimeout(context.Background(), 10*time.Second)
					defer cancelPersist()
					if persistErr := s.userStore.RecordGameResult(persistCtx, snapshot.Code, snapshot.WinnerTeam, snapshot.Players); persistErr != nil {
						log.Printf("persist game result (%s): %v", snapshot.Code, persistErr)
					}
				}()
			}
			return keepGoing, nil
		}
		if errors.Is(watchErr, redis.TxFailedErr) {
			continue
		}
		return false, watchErr
	}
	return false, fmt.Errorf("process game tick: excessive contention on lobby %s", code)
}
