package com.devscast.wendigame.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker // Active le support STOMP WebSocket dans Spring
public class WebSocketService implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-endpoint")
                .setAllowedOriginPatterns("http://localhost:3000") // 🔁 Remplacé setAllowedOrigins → plus flexible
                .withSockJS(); // active SockJS en cas de fallback WebSocket
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");            // 📡 Clients s'abonnent à /topic/...
        registry.setApplicationDestinationPrefixes("/app"); // 🚀 Clients envoient vers /app/...
    }
}
