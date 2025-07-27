package com.devscast.wendigame.controller;

import com.devscast.wendigame.model.Joueur;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
public class LoginController {

    private static final Path PATH = Paths.get("chemin/vers/joueurs.json");

    @PostMapping("/api/login")
    public ResponseEntity<?> login(@RequestBody Joueur credentials) throws IOException {
        if (!Files.exists(PATH)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Aucun joueur enregistré");
        }

        String contenu = Files.readString(PATH);
        List<Joueur> joueurs = new ObjectMapper().readValue(contenu, new TypeReference<List<Joueur>>() {});

        for (Joueur joueur : joueurs) {
            if (joueur.getNom().equals(credentials.getNom()) &&
                    joueur.getMotDePasse().equals(credentials.getMotDePasse())) {
                return ResponseEntity.ok(joueur); // succès
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Identifiants invalides");
    }

}

