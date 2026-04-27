// Package api exposes the server HTTP and WebSocket layer: routing, handlers, and connection hub.
//
// Architectural role: the "How" layer. It receives requests, validates inputs, calls the store
// for persistence, and manages WebSockets for real-time communication. Models describe data;
// the store knows where to persist it; this package orchestrates communication with clients.
package api
