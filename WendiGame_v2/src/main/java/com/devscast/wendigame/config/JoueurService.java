package com.devscast.wendigame.config;

import com.devscast.wendigame.model.Joueur;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;

@Service
public class JoueurService {

    private static final Path PATH = Paths.get("data", "joueurs.json");
    private static final ObjectMapper mapper = new ObjectMapper();

    public List<Joueur> lireTousLesJoueurs() {
        try {
            if (!Files.exists(PATH)) {
                return new ArrayList<>();
            }

            String contenu = Files.readString(PATH);
            return mapper.readValue(contenu, new TypeReference<List<Joueur>>() {});
        } catch (IOException e) {
            System.err.println("Erreur lors de la lecture des joueurs : " + e.getMessage());
            return new ArrayList<>();
        }
    }

    public void sauvegarderTousLesJoueurs(List<Joueur> joueurs) {
        try {
            // Crée le dossier data si nécessaire
            if (!Files.exists(PATH.getParent())) {
                Files.createDirectories(PATH.getParent());
            }

            String jsonFinal = mapper.writerWithDefaultPrettyPrinter()
                    .writeValueAsString(joueurs);

            Files.writeString(PATH, jsonFinal,
                    StandardOpenOption.CREATE,
                    StandardOpenOption.TRUNCATE_EXISTING);

        } catch (IOException e) {
            System.err.println("Erreur lors de la sauvegarde des joueurs : " + e.getMessage());
        }
    }
}
