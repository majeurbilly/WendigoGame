import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, Player, GameState } from '../../types';
import './GameChat.css';

interface GameChatProps {
  chatMessages: ChatMessage[];
  onSendMessage: (message: string, chatType: string) => void;
  gameState: GameState;
  currentPlayer: Player;
  onLoadMessages: (chatType: string) => void;
}

const GameChat: React.FC<GameChatProps> = ({
  chatMessages,
  onSendMessage,
  gameState,
  currentPlayer,
  onLoadMessages
}) => {
  const [message, setMessage] = useState('');
  const [selectedChatType, setSelectedChatType] = useState('public');
  const [showChatTypes, setShowChatTypes] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isNightPhase = gameState.phase === 'NIGHT';
  const isDayPhase = gameState.phase === 'DAY';
  const isVotingPhase = gameState.phase === 'VOTING';

  // Types de chat disponibles selon le rôle et la phase
  const getAvailableChatTypes = () => {
    const types = [
      { id: 'public', name: '🌐 Public', description: 'Chat visible par tous' }
    ];

    // Chat privé pour les jumeaux
    if (currentPlayer.role?.name === 'Jumeaux') {
      types.push({
        id: 'twins',
        name: '👥 Jumeaux',
        description: 'Chat privé entre jumeaux'
      });
    }

    // Chat des fantômes (si le joueur est mort)
    if (currentPlayer.is_dead) {
      types.push({
        id: 'ghosts',
        name: '👻 Fantômes',
        description: 'Chat des joueurs morts'
      });
    }

    // Chat des loups (si le joueur est loup)
    if (currentPlayer.role?.team === 'WOLVES') {
      types.push({
        id: 'wolves',
        name: '🐺 Loups',
        description: 'Chat privé des loups'
      });
    }

    // Chat des villageois (si le joueur est villageois)
    if (currentPlayer.role?.team === 'VILLAGERS') {
      types.push({
        id: 'villagers',
        name: '🛡️ Villageois',
        description: 'Chat privé des villageois'
      });
    }

    return types;
  };

  const availableChatTypes = getAvailableChatTypes();

  // Charger les messages du type de chat sélectionné
  useEffect(() => {
    onLoadMessages(selectedChatType);
  }, [selectedChatType, onLoadMessages]);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim(), selectedChatType);
      setMessage('');
    }
  };

  const handleChatTypeChange = (chatType: string) => {
    setSelectedChatType(chatType);
    setShowChatTypes(false);
  };

  const getChatTypeDisplayName = (chatType: string) => {
    const chatTypeInfo = availableChatTypes.find(t => t.id === chatType);
    return chatTypeInfo ? chatTypeInfo.name : chatType;
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMessageClass = (msg: ChatMessage) => {
    let classes = ['message'];
    
    if (msg.user_id === currentPlayer.user_id) {
      classes.push('own-message');
    }
    
    if (msg.chat_type === 'wolves') {
      classes.push('wolf-message');
    } else if (msg.chat_type === 'villagers') {
      classes.push('villager-message');
    } else if (msg.chat_type === 'twins') {
      classes.push('twin-message');
    } else if (msg.chat_type === 'ghosts') {
      classes.push('ghost-message');
    }
    
    return classes.join(' ');
  };

  const canSendMessage = () => {
    // En phase de nuit, seuls certains rôles peuvent parler
    if (isNightPhase) {
      if (currentPlayer.role?.name === 'Corbeau') return true;
      if (currentPlayer.role?.name === 'Rêveur') return true;
      if (currentPlayer.role?.team === 'WOLVES') return true;
      return false;
    }
    
    // En phase de vote, pas de chat
    if (isVotingPhase) return false;
    
    return true;
  };

  return (
    <div className="game-chat">
      <div className="chat-header">
        <h3>💬 Chat</h3>
        
        <div className="chat-type-selector">
          <button
            className="chat-type-button"
            onClick={() => setShowChatTypes(!showChatTypes)}
          >
            {getChatTypeDisplayName(selectedChatType)}
            <span className="dropdown-arrow">▼</span>
          </button>
          
          {showChatTypes && (
            <div className="chat-types-dropdown">
              {availableChatTypes.map((chatType) => (
                <button
                  key={chatType.id}
                  className={`chat-type-option ${selectedChatType === chatType.id ? 'selected' : ''}`}
                  onClick={() => handleChatTypeChange(chatType.id)}
                  title={chatType.description}
                >
                  {chatType.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages du chat */}
      <div className="chat-messages">
        {chatMessages.length === 0 ? (
          <div className="no-messages">
            <p>Aucun message dans ce chat</p>
            <p className="chat-info">
              {selectedChatType === 'public' && 'Discutez avec tous les joueurs'}
              {selectedChatType === 'wolves' && 'Discutez en privé avec les autres loups'}
              {selectedChatType === 'villagers' && 'Discutez en privé avec les autres villageois'}
              {selectedChatType === 'twins' && 'Discutez en privé avec votre jumeau'}
              {selectedChatType === 'ghosts' && 'Discutez avec les autres fantômes'}
            </p>
          </div>
        ) : (
          chatMessages.map((msg) => (
            <div key={msg.id} className={getMessageClass(msg)}>
              <div className="message-header">
                <span className="message-author">
                  {msg.username || `Joueur ${msg.chair_number + 1}`}
                </span>
                <span className="message-time">
                  {formatMessageTime(msg.timestamp)}
                </span>
              </div>
              
              <div className="message-content">
                {msg.content}
              </div>
              
              {msg.chat_type !== 'public' && (
                <div className="message-type-indicator">
                  {msg.chat_type === 'wolves' && '🐺'}
                  {msg.chat_type === 'villagers' && '🛡️'}
                  {msg.chat_type === 'twins' && '👥'}
                  {msg.chat_type === 'ghosts' && '👻'}
                </div>
              )}
            </div>
          ))
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Formulaire d'envoi de message */}
      {canSendMessage() ? (
        <form onSubmit={handleSendMessage} className="chat-input-form">
          <div className="chat-input-container">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                selectedChatType === 'public' ? 'Tapez votre message...' :
                selectedChatType === 'wolves' ? 'Message privé aux loups...' :
                selectedChatType === 'villagers' ? 'Message privé aux villageois...' :
                selectedChatType === 'twins' ? 'Message à votre jumeau...' :
                selectedChatType === 'ghosts' ? 'Message aux fantômes...' :
                'Tapez votre message...'
              }
              className="chat-input"
              maxLength={200}
            />
            
            <button
              type="submit"
              className="send-button"
              disabled={!message.trim()}
            >
              📤
            </button>
          </div>
          
          <div className="message-counter">
            {message.length}/200
          </div>
        </form>
      ) : (
        <div className="chat-disabled">
          <p>
            {isNightPhase ? '🌙 Le chat est désactivé pendant la nuit' :
             isVotingPhase ? '🗳️ Le chat est désactivé pendant le vote' :
             'Le chat est temporairement désactivé'}
          </p>
        </div>
      )}

      {/* Indicateurs de statut du chat */}
      <div className="chat-status">
        <div className="status-indicator">
          <span className="status-dot online"></span>
          Chat actif
        </div>
        
        {selectedChatType !== 'public' && (
          <div className="chat-type-info">
            {selectedChatType === 'wolves' && '🐺 Chat privé des loups'}
            {selectedChatType === 'villagers' && '🛡️ Chat privé des villageois'}
            {selectedChatType === 'twins' && '👥 Chat privé des jumeaux'}
            {selectedChatType === 'ghosts' && '👻 Chat des fantômes'}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameChat;
