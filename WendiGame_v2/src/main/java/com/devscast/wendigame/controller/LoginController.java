package com.devscast.wendigame.controller;

import com.devscast.wendigame.config.JoueurService;
import com.devscast.wendigame.model.Joueur;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class LoginController {

    private final JoueurService joueurService;

    public LoginController(JoueurService joueurService) {
        this.joueurService = joueurService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Joueur credentials) {
        List<Joueur> joueurs = joueurService.lireTousLesJoueurs();

        for (Joueur joueur : joueurs) {
            if (joueur.getPrenom().equals(credentials.getPrenom()) &&
                    joueur.getMotDePasse().equals(credentials.getMotDePasse())) {
                return ResponseEntity.ok(joueur);
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Identifiants incorrects");
    }

    @PostMapping("/preparation")
    public ResponseEntity<String> mettrePret(@RequestBody Joueur joueurRecu) {
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
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("🚫 Joueur non trouvé : " + joueurRecu.getPrenom());
        }

        joueurService.sauvegarderTousLesJoueurs(joueurs);
        return ResponseEntity.ok("✅ Joueur marqué comme prêt : " + joueurRecu.getPrenom());
    }
}
