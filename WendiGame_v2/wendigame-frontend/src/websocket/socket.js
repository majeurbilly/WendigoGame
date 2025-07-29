// src/utils/stompClient.js
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

// 🌐 Point de connexion WebSocket
const socket = new SockJS('http://localhost:8080/ws-endpoint');

// 🛠️ Configuration du client STOMP
const stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
    debug: (str) => console.log('[STOMP DEBUG]', str),
    onStompError: (frame) => {
        console.error('❌ STOMP error:', frame);
    },
    onWebSocketError: (error) => {
        console.error('❌ WebSocket error:', error);
    },
});

export default stompClient;
