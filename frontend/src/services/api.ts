import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  User, 
  Game, 
  Player, 
  Role, 
  Team, 
  LoginForm, 
  RegisterForm, 
  CreateGameForm,
  ApiResponse,
  PaginatedResponse,
  ApiError 
} from '../types';

// Configuration de l'API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur pour ajouter le token d'authentification
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Intercepteur pour gérer les erreurs
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Méthodes d'authentification
  async login(credentials: LoginForm): Promise<{ access_token: string; token_type: string }> {
    const response: AxiosResponse<{ access_token: string; token_type: string }> = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async register(userData: RegisterForm): Promise<{ access_token: string; token_type: string }> {
    const response: AxiosResponse<{ access_token: string; token_type: string }> = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get('/auth/me');
    return response.data;
  }

  async getUserStats(): Promise<{ games_played: number; games_won: number; total_score: number; win_rate: number }> {
    const response: AxiosResponse<{ games_played: number; games_won: number; total_score: number; win_rate: number }> = await this.api.get('/users/me/stats');
    return response.data;
  }

  // Méthodes pour les jeux
  async getGames(status?: string): Promise<Game[]> {
    const params = status ? { status } : {};
    const response: AxiosResponse<Game[]> = await this.api.get('/games/', { params });
    return response.data;
  }

  async createGame(gameData: CreateGameForm): Promise<Game> {
    const response: AxiosResponse<Game> = await this.api.post('/games/', gameData);
    return response.data;
  }

  async getGame(gameId: string): Promise<Game> {
    const response: AxiosResponse<Game> = await this.api.get(`/games/${gameId}`);
    return response.data;
  }

  async joinGame(gameId: string): Promise<Player> {
    const response: AxiosResponse<Player> = await this.api.post(`/games/${gameId}/join`);
    return response.data;
  }

  async startGame(gameId: string): Promise<Game> {
    const response: AxiosResponse<Game> = await this.api.post(`/games/${gameId}/start`);
    return response.data;
  }

  async getGameStatus(gameId: string): Promise<{ id: string; name: string; status: string; current_phase?: string; current_turn?: number; current_players: number; max_players: number; time_remaining?: number; winner_team_name?: string }> {
    const response: AxiosResponse<{ id: string; name: string; status: string; current_phase?: string; current_turn?: number; current_players: number; max_players: number; time_remaining?: number; winner_team_name?: string }> = await this.api.get(`/games/${gameId}/status`);
    return response.data;
  }

  // Méthodes pour les joueurs
  async getGamePlayers(gameId: string, aliveOnly?: boolean): Promise<Player[]> {
    const params = aliveOnly !== undefined ? { alive_only: aliveOnly } : {};
    const response: AxiosResponse<Player[]> = await this.api.get(`/players/game/${gameId}`, { params });
    return response.data;
  }

  async getCurrentPlayer(gameId: string): Promise<Player> {
    const response: AxiosResponse<Player> = await this.api.get(`/players/game/${gameId}/me`);
    return response.data;
  }

  async setPlayerReady(gameId: string, isReady: boolean): Promise<Player> {
    const response: AxiosResponse<Player> = await this.api.put(`/players/game/${gameId}/ready`, { is_ready: isReady });
    return response.data;
  }

  async selectChair(gameId: string, chairPosition: number): Promise<Player> {
    const response: AxiosResponse<Player> = await this.api.put(`/players/game/${gameId}/chair`, { chair_position: chairPosition });
    return response.data;
  }

  async updatePlayerNotes(gameId: string, notes: string): Promise<Player> {
    const response: AxiosResponse<Player> = await this.api.put(`/players/game/${gameId}/notes`, { personal_notes: notes });
    return response.data;
  }

  async getPlayerNeighbors(gameId: string): Promise<{ left: Player; right: Player }> {
    const response: AxiosResponse<{ left: Player; right: Player }> = await this.api.get(`/players/game/${gameId}/neighbors`);
    return response.data;
  }

  async getLeftNeighbors(gameId: string, count: number): Promise<Player[]> {
    const response: AxiosResponse<Player[]> = await this.api.get(`/players/game/${gameId}/left-neighbors`, { params: { count } });
    return response.data;
  }

  // Méthodes pour les rôles
  async getRoles(teamId?: string): Promise<Role[]> {
    const params = teamId ? { team_id: teamId } : {};
    const response: AxiosResponse<Role[]> = await this.api.get('/roles/', { params });
    return response.data;
  }

  async getRole(roleId: string): Promise<Role> {
    const response: AxiosResponse<Role> = await this.api.get(`/roles/${roleId}`);
    return response.data;
  }

  async getRolesByTeam(teamName: string): Promise<Role[]> {
    const response: AxiosResponse<Role[]> = await this.api.get(`/roles/team/${teamName}`);
    return response.data;
  }

  // Méthodes pour les équipes
  async getTeams(): Promise<Team[]> {
    const response: AxiosResponse<Team[]> = await this.api.get('/teams/');
    return response.data;
  }

  async getTeam(teamId: string): Promise<Team> {
    const response: AxiosResponse<Team> = await this.api.get(`/teams/${teamId}`);
    return response.data;
  }

  // Méthodes pour les utilisateurs
  async getUsers(): Promise<User[]> {
    const response: AxiosResponse<User[]> = await this.api.get('/users/');
    return response.data;
  }

  async getUser(userId: string): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get(`/users/${userId}`);
    return response.data;
  }

  async updateUser(userData: Partial<User>): Promise<User> {
    const response: AxiosResponse<User> = await this.api.put('/users/me', userData);
    return response.data;
  }

  // Méthodes utilitaires
  async healthCheck(): Promise<{ status: string }> {
    const response: AxiosResponse<{ status: string }> = await this.api.get('/health');
    return response.data;
  }

  async getApiInfo(): Promise<{ name: string; version: string; description: string }> {
    const response: AxiosResponse<{ name: string; version: string; description: string }> = await this.api.get('/info');
    return response.data;
  }

  // Méthodes pour gérer les tokens
  setAuthToken(token: string): void {
    localStorage.setItem('token', token);
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken(): void {
    localStorage.removeItem('token');
    delete this.api.defaults.headers.common['Authorization'];
  }

  getAuthToken(): string | null {
    return localStorage.getItem('token');
  }
}

// Instance singleton
const apiService = new ApiService();
export default apiService;
