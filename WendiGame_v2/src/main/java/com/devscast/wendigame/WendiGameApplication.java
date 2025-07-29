package com.devscast.wendigame;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 🚀 Classe principale — lance ton application WendiGame.
 * L’annotation @SpringBootApplication active :
 * - la configuration automatique de Spring Boot
 * - la détection des composants (controllers, services…)
 * - le scan des packages du projet
 */
@SpringBootApplication
public class WendiGameApplication {

    public static void main(String[] args) {
        // ⏯️ Démarre le serveur Spring Boot
        SpringApplication.run(WendiGameApplication.class, args);
    }
}
