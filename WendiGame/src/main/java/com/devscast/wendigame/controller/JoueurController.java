package com.devscast.wendigame.controller;

import com.devscast.wendigame.config.WebSocketService;
import com.devscast.wendigame.config.JoueurService;
import com.devscast.wendigame.model.Joueur;
import com.devscast.wendigame.model.PartieStatus;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@RestController
@RequestMapping("/api/joueur")
@CrossOrigin(origins = "*") // 🔓 Autorise le frontend à communiquer avec ton backend
public class JoueurController {

    private static final Path PATH = Paths.get("joueurs.json");
    private final ObjectMapper mapper = new ObjectMapper();

    private final WebSocketService webSocketService;
    private final JoueurService joueurService;

    public JoueurController(WebSocketService webSocketService, JoueurService joueurService) {
        this.webSocketService = webSocketService;
        this.joueurService = joueurService;
    }

    // ➕ Ajouter un joueur
    @PostMapping
    public ResponseEntity<String> creerJoueur(@RequestBody Joueur joueur) throws IOException {
        List<Joueur> joueurs = new ArrayList<>();
        if (Files.exists(PATH)) {
            String contenu = Files.readString(PATH);
            joueurs = mapper.readValue(contenu, new TypeReference<>() {});
        }
        joueurs.add(joueur);
        String jsonFinal = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(joueurs);
        Files.writeString(PATH, jsonFinal, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
        return ResponseEntity.status(201).body("✅ Joueur ajouté avec succès !");
    }

    // 📋 Liste des joueurs
    @GetMapping("/joueurs")
    public ResponseEntity<List<Joueur>> getJoueurs() {
        try {
            if (!Files.exists(PATH)) {
                return ResponseEntity.status(404).body(new ArrayList<>());
            }
            String contenu = Files.readString(PATH);
            List<Joueur> joueurs = mapper.readValue(contenu, new TypeReference<>() {});
            return ResponseEntity.ok(joueurs);
        } catch (IOException e) {
            return ResponseEntity.status(500).body(new ArrayList<>());
        }
    }

    // ✅ Marquer un joueur comme "prêt"
    @PostMapping("/setpret")
    public ResponseEntity<String> setPret(@RequestBody Joueur joueurRecu) throws IOException {
        if (!Files.exists(PATH)) {
            return ResponseEntity.status(404).body("❌ Fichier joueurs introuvable.");
        }
        String contenu = Files.readString(PATH);
        List<Joueur> joueurs = mapper.readValue(contenu, new TypeReference<>() {});
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

    // 🔁 Rafraîchissement global (optionnel)
    @PostMapping("/rafraichir")
    public ResponseEntity<String> rafraichir() {
        return ResponseEntity.ok("🔁 Rafraîchissement global déclenché !");
    }

    // 🚀 Lancer la partie
    @PostMapping("/lancerPartie")
    public ResponseEntity<Void> lancerPartie(@RequestBody Map<String, String> payload) {
        String commanditaire = payload.get("commanditaire");
        try {
            List<Joueur> joueurs = joueurService.lireTousLesJoueurs();
            for (Joueur j : joueurs) {
                j.setPret(true);
            }
            joueurService.sauvegarderTousLesJoueurs(joueurs);
            PartieStatus.partieLancee = true; // ✅ Marquer la partie lancée
            return ResponseEntity.ok().build();
        } catch (IOException e) {
            return ResponseEntity.status(500).build();
        }
    }

    // 🆕 Ajouté pour le frontend : état actuel de la partie
    @GetMapping("/etatPartie")
    public ResponseEntity<Map<String, Boolean>> getEtatPartie() {
        Map<String, Boolean> response = new HashMap<>();
        response.put("estLancee", PartieStatus.partieLancee);
        return ResponseEntity.ok(response);
    }
}
