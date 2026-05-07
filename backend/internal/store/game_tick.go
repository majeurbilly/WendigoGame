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
			ps := models.EffectivePhaseSettings(&lobby)
			if lobby.Phase == "" {
				lobby.Phase = models.GamePhaseLobby
			}
			if lobby.Phase == models.GamePhaseLobby || lobby.Phase == models.PhaseGameOver {
				return nil
			}
			if lobby.IsPaused {
				keepGoing = true
				return nil
			}
			if lobby.Phase == models.GamePhaseNight {
				alivePlayers := countAlivePlayers(&lobby)
				if alivePlayers > 0 && len(lobby.NightActions) >= alivePlayers {
					models.SetPhaseCountdown(&lobby, 0)
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
					models.SetPhaseCountdown(&lobby, ps.ChairSelectionSeconds)
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
							models.SetPhaseCountdown(&lobby, ps.ChairSelectionSeconds)
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
						lobby.Prayers = make(map[string]string)
						lobby.WendigoIntentions = make(map[string]string)
						lobby.WendigoIntents = make(map[string]string)
					}
				} else if previousPhase == models.GamePhaseAccusation {
					lobby.Phase = models.GamePhaseCouncilSummary
					models.SetPhaseCountdown(&lobby, ps.CouncilSummarySeconds)
					lobby.Votes = make(map[string]string)
					lobby.NightActions = make(map[string]string)
					lobby.Prayers = make(map[string]string)
					lobby.WendigoIntentions = make(map[string]string)
					lobby.WendigoIntents = make(map[string]string)
				} else if previousPhase == models.GamePhaseCouncilSummary {
					if len(lobby.CouncilAccusations) > 0 {
						startPleadingsFromAccusation(&lobby)
					} else {
						lobby.Phase = models.GamePhaseCouncilVote
						models.SetPhaseCountdown(&lobby, ps.CouncilVoteSeconds)
					}
					lobby.Votes = make(map[string]string)
					lobby.NightActions = make(map[string]string)
					lobby.Prayers = make(map[string]string)
					lobby.WendigoIntentions = make(map[string]string)
					lobby.WendigoIntents = make(map[string]string)
				} else if previousPhase == models.GamePhasePleadings {
					if len(lobby.PleadingsQueue) > 0 {
						lobby.CurrentSpeakerID = lobby.PleadingsQueue[0]
						lobby.PleadingsQueue = lobby.PleadingsQueue[1:]
						lobby.PleadingTimerStarted = false
						models.SetPhaseCountdown(&lobby, 0)
					} else {
						next, seconds := models.GetNextPhaseAndTime(models.GamePhasePleadings, ps)
						lobby.Phase = next
						models.SetPhaseCountdown(&lobby, seconds)
						clearPleadingsState(&lobby)
						lobby.CouncilAccusations = make(map[string]string)
						lobby.DefendantID = ""
						lobby.Votes = make(map[string]string)
						lobby.NightActions = make(map[string]string)
						lobby.Prayers = make(map[string]string)
						lobby.WendigoIntentions = make(map[string]string)
						lobby.WendigoIntents = make(map[string]string)
					}
				} else if previousPhase == models.GamePhaseCouncilVote {
					applyCouncilVoteElimination(&lobby)
					lobby.DefendantID = ""
					if victory, winner := CheckVictoryConditions(&lobby); victory {
						lobby.Phase = models.PhaseGameOver
						lobby.WinnerTeam = winner
						models.SetPhaseCountdown(&lobby, 0)
						shouldPersistOutcome = true
						finishedLobbySnapshot = lobby
					} else {
						lobby.Phase = models.GamePhaseStake
						models.SetPhaseCountdown(&lobby, ps.StakeSeconds)
					}
					lobby.NightActions = make(map[string]string)
					lobby.Prayers = make(map[string]string)
					lobby.WendigoIntentions = make(map[string]string)
					lobby.WendigoIntents = make(map[string]string)
				} else if previousPhase == models.GamePhaseMorning {
					lobby.Phase = models.GamePhaseDay
					models.SetPhaseCountdown(&lobby, ps.DaySocialSeconds)
					enterDaySocialSnapshot(&lobby)
					lobby.Votes = make(map[string]string)
					lobby.NightActions = make(map[string]string)
					lobby.Prayers = make(map[string]string)
					lobby.WendigoIntentions = make(map[string]string)
					lobby.WendigoIntents = make(map[string]string)
				} else if previousPhase == models.GamePhaseNight {
					if lobby.SurrenderApproved {
						applyImmediateGameOver(&lobby)
						lobby.SurrenderApproved = false
						lobby.SurrenderVoteActive = false
						lobby.SurrenderVotes = make(map[string]bool)
						shouldPersistOutcome = true
						finishedLobbySnapshot = lobby
					} else {
						alivePlayers := make(map[string]models.Player)
						for i := range lobby.Players {
							player := lobby.Players[i]
							if player.IsAlive {
								alivePlayers[player.ID.String()] = player
							}
						}

						totalPrayers := 0
						prayerCounts := make(map[string]int)
						for sourceID, targetID := range lobby.Prayers {
							_, sourceAlive := alivePlayers[sourceID]
							_, targetAlive := alivePlayers[targetID]
							if !sourceAlive || !targetAlive {
								continue
							}
							totalPrayers++
							prayerCounts[targetID]++
						}
						if totalPrayers == 0 {
							for sourceID, targetID := range lobby.NightActions {
								sourcePlayer, sourceAlive := alivePlayers[sourceID]
								_, targetAlive := alivePlayers[targetID]
								if !sourceAlive || !targetAlive || isWendigoRoleName(sourcePlayer.Role) {
									continue
								}
								totalPrayers++
								prayerCounts[targetID]++
							}
						}
						protectedTargetID := protectedPrayerTargetID(prayerCounts, totalPrayers)

						killTally := make(map[string]int)
						for sourceID, targetID := range lobby.NightActions {
							sourcePlayer, sourceOk := alivePlayers[sourceID]
							if !sourceOk || !isWendigoRoleName(sourcePlayer.Role) {
								continue
							}
							if strings.TrimSpace(targetID) == "" {
								continue
							}
							if _, targetOk := alivePlayers[targetID]; !targetOk {
								continue
							}
							killTally[targetID]++
						}
						wendigoTargetID := wendigoKillVictimFromTally(killTally)

						deceasedIDs, summary := ResolveNight(&lobby)
						for i := range deceasedIDs {
							for playerIndex := range lobby.Players {
								if lobby.Players[playerIndex].ID.String() == deceasedIDs[i] {
									lobby.Players[playerIndex].IsAlive = false
								}
							}
						}

						if len(deceasedIDs) > 0 {
							lobby.LastNightVictimID = deceasedIDs[0]
							lobby.LastNightSavedByPrayer = false
						} else if wendigoTargetID != "" && wendigoTargetID == protectedTargetID {
							lobby.LastNightVictimID = ""
							lobby.LastNightSavedByPrayer = true
						} else {
							lobby.LastNightVictimID = ""
							lobby.LastNightSavedByPrayer = false
						}

						log.Printf("game tick: %s", summary)
						if victory, winner := CheckVictoryConditions(&lobby); victory {
							lobby.Phase = models.PhaseGameOver
							lobby.WinnerTeam = winner
							models.SetPhaseCountdown(&lobby, 0)
							shouldPersistOutcome = true
							finishedLobbySnapshot = lobby
						} else {
							lobby.Phase = models.GamePhaseMorning
							models.SetPhaseCountdown(&lobby, ps.MorningSeconds)
						}
					}

					lobby.Votes = make(map[string]string)
					lobby.NightActions = make(map[string]string)
					lobby.Prayers = make(map[string]string)
					lobby.WendigoIntentions = make(map[string]string)
					lobby.WendigoIntents = make(map[string]string)
				} else {
					if previousPhase == models.GamePhaseDay && lobby.DefendantID == "" {
						lobby.DefendantID = pickDefendantAtEndOfDay(&lobby)
					}

					next, seconds := lobby.GetNextPhase()
					lobby.Phase = next
					models.SetPhaseCountdown(&lobby, seconds)
					if lobby.Phase == models.GamePhaseDay {
						enterDaySocialSnapshot(&lobby)
					}
					if previousPhase == models.GamePhaseStake && next == models.GamePhaseNight {
						lobby.CouncilAccusations = make(map[string]string)
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
							models.SetPhaseCountdown(&lobby, 0)
							shouldPersistOutcome = true
							finishedLobbySnapshot = lobby
						}
						lobby.WendigoIntentions = make(map[string]string)
						lobby.WendigoIntents = make(map[string]string)
					}

					lobby.Votes = make(map[string]string)
					lobby.NightActions = make(map[string]string)
					lobby.Prayers = make(map[string]string)
					lobby.WendigoIntentions = make(map[string]string)
					lobby.WendigoIntents = make(map[string]string)
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
