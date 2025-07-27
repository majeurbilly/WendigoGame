package com.devscast.wendigame.controller;

import com.devscast.wendigame.model.Joueur;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/joueur")
public class JoueurController {

    private static final Path PATH = Paths.get("joueurs.json");

    @PostMapping
    public ResponseEntity<String> creerJoueur(@RequestBody Joueur joueur) throws IOException {
        List<Joueur> joueurs = new ArrayList<>();

        // Lire le fichier existant s'il existe
        if (Files.exists(PATH)) {
            String contenu = Files.readString(PATH);
            joueurs = new ObjectMapper().readValue(contenu, new TypeReference<List<Joueur>>() {});
        }

        joueurs.add(joueur);

        // Réécriture du fichier
        String jsonFinal = new ObjectMapper().writerWithDefaultPrettyPrinter().writeValueAsString(joueurs);
        Files.writeString(PATH, jsonFinal, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

        return ResponseEntity.status(HttpStatus.CREATED).body("Joueur ajouté !");
    }
}

