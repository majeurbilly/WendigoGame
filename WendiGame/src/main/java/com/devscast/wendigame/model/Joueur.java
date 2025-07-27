package com.devscast.wendigame.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class Joueur {
    private String nom;
    private String prenom;
    private String email;
    private String motDePasse;
}
