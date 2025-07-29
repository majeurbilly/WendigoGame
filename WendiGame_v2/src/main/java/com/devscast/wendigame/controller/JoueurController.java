package com.devscast.wendigame.controller;

import com.devscast.wendigame.config.JoueurService;
import com.devscast.wendigame.model.Joueur;
import com.devscast.wendigame.model.PartieStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/joueur")
@CrossOrigin(origins = "*") // 🔓 Autorise le frontend à communiquer avec ton backend
public class JoueurController {

    private final JoueurService joueurService;

    public JoueurController(JoueurService joueurService) {
        this.joueurService = joueurService;
    }

    // ➕ Ajouter un joueur
    @PostMapping
    public ResponseEntity<String> creerJoueur(@RequestBody Joueur joueur) {
        List<Joueur> joueurs = joueurService.lireTousLesJoueurs();
        joueurs.add(joueur);
        joueurService.sauvegarderTousLesJoueurs(joueurs);
        return ResponseEntity.status(201).body("✅ Joueur ajouté avec succès !");
    }

    // 📋 Liste des joueurs
    @GetMapping("/joueurs")
    public ResponseEntity<List<Joueur>> getJoueurs() {
        List<Joueur> joueurs = joueurService.lireTousLesJoueurs();
        return ResponseEntity.ok(joueurs);
    }

    // ✅ Marquer un joueur comme "prêt"
    @PostMapping("/setpret")
    public ResponseEntity<String> setPret(@RequestBody Joueur joueurRecu) {
        List<Joueur> joueurs = joueurService.lireTousLesJoueurs();
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
        joueurService.sauvegarderTousLesJoueurs(joueurs);
        return ResponseEntity.ok("✅ Statut 'prêt' mis à jour pour " + joueurRecu.getPrenom());
    }

    // 🔁 Rafraîchissement global
    @PostMapping("/rafraichir")
    public ResponseEntity<String> rafraichir() {
        return ResponseEntity.ok("🔁 Rafraîchissement global déclenché !");
    }

    // 🚀 Lancer la partie
    @PostMapping("/lancerPartie")
    public ResponseEntity<Void> lancerPartie(@RequestBody Map<String, String> payload) {
        String commanditaire = payload.get("commanditaire");
        List<Joueur> joueurs = joueurService.lireTousLesJoueurs();
        for (Joueur joueur : joueurs) {
            joueur.setPret(true);
        }
        joueurService.sauvegarderTousLesJoueurs(joueurs);
        PartieStatus.partieLancee = true;
        return ResponseEntity.ok().build();
    }

    // 🆕 État de la partie
    @GetMapping("/etatPartie")
    public ResponseEntity<Map<String, Boolean>> getEtatPartie() {
        Map<String, Boolean> response = new HashMap<>();
        response.put("estLancee", PartieStatus.partieLancee);
        return ResponseEntity.ok(response);
    }
}
