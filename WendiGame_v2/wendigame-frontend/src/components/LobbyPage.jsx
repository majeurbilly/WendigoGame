// src/components/LobbyPage.jsx
import React, { useEffect, useState, useRef, useContext } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { UserContext } from '../contexts/UserContext';

const LobbyPage = () => {
    const [roomId, setRoomId] = useState('');
    const [players, setPlayers] = useState([]);
    const [stompClient, setStompClient] = useState(null);
    const subscriptionRef = useRef(null);
    const { user } = useContext(UserContext);
    const username = user?.prenom || '';

    useEffect(() => {
        const socket = new SockJS('http://localhost:8080/ws-endpoint');
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            onConnect: () => {
                console.log('🟢 STOMP connecté');
                setStompClient(client);
            },
            onStompError: (frame) => {
                console.error('❌ STOMP Error:', frame);
            }
        });

        client.activate();

        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
                subscriptionRef.current = null;
            }
            if (client) client.deactivate();
        };
    }, []);

    const handleJoin = () => {
        if (stompClient && roomId.trim() !== '' && username.trim() !== '') {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
                subscriptionRef.current = null;
            }

            const sub = stompClient.subscribe(`/topic/lobby/${roomId}`, (message) => {
                try {
                    const list = JSON.parse(message.body);
                    setPlayers(list);
                } catch (error) {
                    console.error('Erreur JSON:', error);
                }
            });

            subscriptionRef.current = sub;

            stompClient.publish({
                destination: `/app/lobby/${roomId}`,
                body: username,
            });
        }
    };

    const handleLeave = () => {
        if (stompClient && roomId.trim() !== '' && username.trim() !== '') {
            stompClient.publish({
                destination: `/app/leave/${roomId}`,
                body: username,
            });

            setPlayers([]);

            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
                subscriptionRef.current = null;
            }
        }
    };

    return (
        <div className="container mt-4">
            <h2>🎮 Lobby Room : <strong>{roomId || '–'}</strong></h2>

            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Nom de la room..."
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                />
            </div>

            <div className="mb-3">
                <button className="btn btn-primary me-2" onClick={handleJoin}>Rejoindre</button>
                <button className="btn btn-danger" onClick={handleLeave}>Quitter</button>
            </div>

            <h4>👥 Joueurs connectés :</h4>
            <ul className="list-group">
                {players.length > 0 ? (
                    players.map((player, idx) => (
                        <li key={idx} className="list-group-item">{player}</li>
                    ))
                ) : (
                    <li className="list-group-item text-muted">Aucun joueur dans le lobby</li>
                )}
            </ul>
        </div>
    );
};

export default LobbyPage;
