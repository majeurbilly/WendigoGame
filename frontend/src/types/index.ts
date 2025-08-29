// Types pour l'authentification
export interface User {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  games_played: number;
  games_won: number;
  total_score: number;
  created_at: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Types pour les équipes
export interface Team {
  id: string;
  name: string;
  description: string;
  color: string;
  created_at: string;
  updated_at?: string;
}

// Types pour les rôles
export interface Role {
  id: string;
  name: string;
  description: string;
  power_description: string;
  team_id: string;
  is_unique: boolean;
  phase_action: 'DAY' | 'NIGHT' | 'NONE';
  usage_limit?: number;
  emoji?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  created_at: string;
  updated_at?: string;
  team_name?: string;
  team_color?: string;
}

// Types pour les jeux
export interface Game {
  id: string;
  name: string;
  description?: string;
  min_players: number;
  max_players: number;
  current_players: number;
  status: GameStatus;
  current_phase?: string;
  current_turn?: number;
  current_phase_start?: string;
  current_phase_end?: string;
  winner_team_id?: string;
  winner_team_name?: string;
  game_duration?: number;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  started_at?: string;
  finished_at?: string;
}

export enum GameStatus {
  CREATED = 'CREATED',
  WAITING = 'WAITING',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED'
}

// Types pour les joueurs
export interface Player {
  id: string;
  user_id: string;
  game_id: string;
  role_id: string;
  team_id: string;
  is_alive: boolean;
  is_ready: boolean;
  is_connected: boolean;
  chair_position?: number;
  has_selected_chair: boolean;
  power_usage_count: number;
  last_power_usage?: string;
  personal_notes?: string;
  joined_at: string;
  died_at?: string;
  last_activity: string;
  username?: string;
  role_name?: string;
  team_name?: string;
}

// Types pour les votes
export interface Vote {
  id: string;
  game_id: string;
  voter_id: string;
  target_id?: string;
  vote_type: VoteType;
  phase: string;
  turn_number: number;
  result?: VoteResult;
  vote_count?: number;
  created_at: string;
  resolved_at?: string;
}

export enum VoteType {
  ACCUSATION = 'ACCUSATION',
  CONDEMNATION = 'CONDEMNATION',
  WOLF = 'WOLF'
}

export enum VoteResult {
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  TIE = 'TIE'
}

// Types pour les actions
export interface Action {
  id: string;
  game_id: string;
  actor_id: string;
  target_id?: string;
  action_type: ActionType;
  phase: string;
  turn_number: number;
  status: ActionStatus;
  success?: boolean;
  message?: string;
  additional_data?: any;
  created_at: string;
  executed_at?: string;
}

export enum ActionType {
  USE_POWER = 'USE_POWER',
  PROTECT = 'PROTECT',
  ATTACK = 'ATTACK',
  INVESTIGATE = 'INVESTIGATE',
  TRANSFORM = 'TRANSFORM',
  RESURRECT = 'RESURRECT'
}

export enum ActionStatus {
  PENDING = 'PENDING',
  EXECUTED = 'EXECUTED',
  BLOCKED = 'BLOCKED',
  CANCELLED = 'CANCELLED'
}

// Types pour les phases
export interface Phase {
  id: string;
  game_id: string;
  phase_type: PhaseType;
  turn_number: number;
  duration_seconds: number;
  started_at: string;
  ended_at?: string;
  is_active: boolean;
  description?: string;
  events?: string;
}

export enum PhaseType {
  DAY = 'DAY',
  EVENING = 'EVENING',
  NIGHT = 'NIGHT',
  REVEAL = 'REVEAL'
}

// Types pour les messages WebSocket
export interface WebSocketMessage {
  type: string;
  data: any;
}

export interface ChatMessage {
  player_id: string;
  username: string;
  message: string;
  chat_type: ChatType;
  timestamp: string;
}

export enum ChatType {
  PUBLIC = 'public',
  WOLF = 'wolf',
  GHOST = 'ghost',
  MEDIUM = 'medium',
  TWINS = 'twins',
  POLTERGEIST = 'poltergeist'
}

export interface GameUpdate {
  game_id: string;
  status: GameStatus;
  current_phase?: string;
  current_turn?: number;
  time_remaining?: number;
}

// Types pour les formulaires
export interface LoginForm {
  username: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface CreateGameForm {
  name: string;
  description?: string;
  min_players: number;
  max_players: number;
}

// Types pour les états de jeu
export interface GameState {
  currentGame: Game | null;
  players: Player[];
  currentPhase: Phase | null;
  timeRemaining: number;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LobbyState {
  lobbies: Game[];
  currentLobby: Game | null;
  players: Player[];
  isLoading: boolean;
  error: string | null;
}

// Types pour les notes personnelles
export interface PlayerNote {
  player_id: string;
  notes: string;
  suspected_role?: string;
  updated_at: string;
}

// Types pour les statistiques
export interface UserStats {
  games_played: number;
  games_won: number;
  total_score: number;
  win_rate: number;
  favorite_role?: string;
  most_played_role?: string;
}

// Types pour les réponses API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Types pour les erreurs
export interface ApiError {
  detail: string;
  status_code: number;
  message?: string;
}

// Types pour les configurations
export interface AppConfig {
  apiUrl: string;
  wsUrl: string;
  gameSettings: {
    minPlayers: number;
    maxPlayers: number;
    dayPhaseDuration: number;
    nightPhaseDuration: number;
  };
}
