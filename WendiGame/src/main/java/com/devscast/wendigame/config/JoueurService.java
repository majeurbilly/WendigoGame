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

    private static final Path PATH = Paths.get("joueurs.json");
    private final ObjectMapper mapper = new ObjectMapper();

    public List<Joueur> lireTousLesJoueurs() throws IOException {
        if (!Files.exists(PATH)) {
            return new ArrayList<>();
        }
        String contenu = Files.readString(PATH);
        return mapper.readValue(contenu, new TypeReference<List<Joueur>>() {});
    }

    public void sauvegarderTousLesJoueurs(List<Joueur> joueurs) throws IOException {
        String jsonFinal = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(joueurs);
        Files.writeString(PATH, jsonFinal, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
    }
}
