# Party game présentiel (local only)

## État actuel

WendigoGame est un **party game strictement présentiel** : les joueurs sont dans la même pièce, rejoignent via un code lobby à 4 caractères, et le serveur pilote les phases / WebSockets.

Le mode distant (« online ») a été retiré du produit : plus de sélection UI, plus d’acceptation API d’un `mode: "online"`.

## Choix techniques

- **Frontend** : `createLobbyAPI()` poste `{}` sans champ `mode`. Le dashboard n’expose qu’un bouton « Create Lobby » (+ Join / Profile / Settings).
- **Backend** : `CreateLobby` / `CreateLobbyForHost` forcent toujours `models.GameModeLocal`. Le body HTTP n’accepte plus que `host_name` (optionnel).
- **Champ JSON `mode`** : conservé sur les DTOs lobby pour compatibilité Redis / clients, toujours égal à `"local"`.
- **Badges UI** : libellé fixe « In person » (plus de branche Online).

## Impacts

| Composant | Impact |
|-----------|--------|
| `DashboardPage`, `LobbyManager` | Plus d’option Online |
| `WaitingRoom`, `LocalDashboard`, `GameHeader` | Badge présentiel uniquement |
| `POST /lobbies` | Plus de validation `mode` |
| Tests API | Bodies sans `mode` |
| Scaling multi-instances | Indépendant de ce cleanup (Hub WS toujours in-memory) |
