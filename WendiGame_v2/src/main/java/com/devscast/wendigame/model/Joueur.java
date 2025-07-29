package com.devscast.wendigame.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Joueur {

    private String nom;
    private String prenom;
    private String email;

    @JsonIgnore // Ne pas exposer le mot de passe dans les réponses JSON
    private String motDePasse;

    private boolean pret;

    private String role; // Ex: "host", "invité", "spectateur"

    public String getNomComplet() {
        return prenom + " " + nom;
    }
}
