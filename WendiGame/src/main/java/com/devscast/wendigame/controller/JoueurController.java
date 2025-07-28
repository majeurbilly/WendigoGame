package com.devscast.wendigame.controller;

import com.devscast.wendigame.config.WebSocketService;
import com.devscast.wendigame.dto.CommandeDTO;
import com.devscast.wendigame.model.Joueur;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/joueur")
public class JoueurController {

    private static final Path PATH = Paths.get("joueurs.json");
    private final ObjectMapper mapper = new ObjectMapper();

    // ➕ Ajouter un joueur
    @PostMapping
    public ResponseEntity<String> creerJoueur(@RequestBody Joueur joueur) throws IOException {
        List<Joueur> joueurs = new ArrayList<>();

        if (Files.exists(PATH)) {
            String contenu = Files.readString(PATH);
            joueurs = mapper.readValue(contenu, new TypeReference<List<Joueur>>() {});
        }

        joueurs.add(joueur);

        String jsonFinal = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(joueurs);
        Files.writeString(PATH, jsonFinal, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

        return ResponseEntity.status(201).body("✅ Joueur ajouté avec succès !");
    }

    // 📋 Récupérer la liste des joueurs
    @GetMapping("/joueurs")
    public ResponseEntity<String> getJoueurs() throws IOException {
        if (!Files.exists(PATH)) {
            return ResponseEntity.status(404).body("⚠️ Aucun joueur enregistré pour le moment.");
        }

        String json = Files.readString(PATH);
        return ResponseEntity.ok(json);
    }

    // ✅ Marquer un joueur comme "prêt"
    @PostMapping("/setpret")
    public ResponseEntity<String> setPret(@RequestBody Joueur joueurRecu) throws IOException {
        if (!Files.exists(PATH)) {
            return ResponseEntity.status(404).body("❌ Fichier joueurs introuvable.");
        }

        String contenu = Files.readString(PATH);
        List<Joueur> joueurs = mapper.readValue(contenu, new TypeReference<List<Joueur>>() {});

        boolean updated = false;
        for (Joueur joueur : joueurs) {
            if (joueur.getPrenom().equalsIgnoreCase(joueurRecu.getPrenom())) {
                joueur.setPret(true);
                updated = true;
                break;
            }
        }

        if (!updated) {
            return ResponseEntity.status(404).body("🚫 Joueur non trouvé : " + joueurRecu.getPrenom());
        }

        String jsonFinal = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(joueurs);
        Files.writeString(PATH, jsonFinal, StandardOpenOption.TRUNCATE_EXISTING);

        return ResponseEntity.ok("✅ Statut 'prêt' mis à jour pour " + joueurRecu.getPrenom());
    }

    // 🔄 Rafraîchissement pour les autres clients (placeholder)
    @PostMapping("/rafraichir")
    public ResponseEntity<String> rafraichir() {
        // À implémenter plus tard avec WebSocket ou Server Sent Events
        return ResponseEntity.ok("🔁 Rafraîchissement global déclenché !");
    }

    @PostMapping("/lancerPartie")
    public ResponseEntity<Void> lancerPartie(@RequestBody CommandeDTO commande) {
        webSocketService.envoyerTous("lancer", "La partie commence !");
        return ResponseEntity.ok().build();
    }

    private final WebSocketService webSocketService;

    public JoueurController(WebSocketService webSocketService) {
        this.webSocketService = webSocketService;
    }

}
