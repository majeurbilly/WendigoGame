import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginForm, RegisterForm } from '../types';
import apiService from '../services/api';

// Types pour les actions
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'CLEAR_ERROR' };

// État initial
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

// Reducer pour l'authentification
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        isLoading: false,
      };
    default:
      return state;
  }
};

// Interface pour le contexte
interface AuthContextType extends AuthState {
  login: (credentials: LoginForm) => Promise<void>;
  register: (userData: RegisterForm) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
}

// Création du contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Props pour le provider
interface AuthProviderProps {
  children: ReactNode;
}

// Provider du contexte d'authentification
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          apiService.setAuthToken(token);
          const user = await apiService.getCurrentUser();
          
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user, token }
          });
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'CLEAR_ERROR' });
      }
    };

    checkAuth();
  }, []);

  // Fonction de connexion
  const login = async (credentials: LoginForm): Promise<void> => {
    try {
      dispatch({ type: 'LOGIN_START' });

      const response = await apiService.login(credentials);
      const user = await apiService.getCurrentUser();

      // Sauvegarder dans le localStorage
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(user));

      // Configurer le token dans le service API
      apiService.setAuthToken(response.access_token);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token: response.access_token }
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Connexion échouée';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Fonction d'inscription
  const register = async (userData: RegisterForm): Promise<void> => {
    try {
      dispatch({ type: 'LOGIN_START' });

      const response = await apiService.register(userData);
      const user = await apiService.getCurrentUser();

      // Sauvegarder dans le localStorage
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(user));

      // Configurer le token dans le service API
      apiService.setAuthToken(response.access_token);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token: response.access_token }
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Inscription échouée';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Fonction de déconnexion
  const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    apiService.removeAuthToken();
    dispatch({ type: 'LOGOUT' });
  };

  // Fonction de mise à jour de l'utilisateur
  const updateUser = async (userData: Partial<User>): Promise<void> => {
    try {
      const updatedUser = await apiService.updateUser(userData);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Mise à jour échouée';
      throw new Error(errorMessage);
    }
  };

  // Fonction pour effacer les erreurs
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Valeur du contexte
  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
