document.addEventListener("DOMContentLoaded", () => {
    // 📌 Navigation vers création de compte
    const button_cree_profil = document.querySelector("#btn_cree_profil");
    const login_page = document.querySelector("#login_page");
    const cree_profil_page = document.querySelector("#cree_profil_page");
    const waiting_page = document.querySelector("#waiting_page");
    const game_home_page = document.querySelector("#game_home_page");

    button_cree_profil.addEventListener("click", () => {
        login_page.classList.add("hidden");
        cree_profil_page.classList.remove("hidden");
        document.body.style.backgroundColor = "#454544";
    });

    // 🎮 Menu de Connexion --- Connexion avec prénom
    const formulaire_login = document.querySelector("#login_page form");

    formulaire_login.addEventListener("submit", (event) => {
        event.preventDefault();

        const prenom = document.querySelector("#username").value.trim(); // ✅ interprété comme prénom
        const motDePasse = document.querySelector("#password").value.trim();

        fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prenom, motDePasse }) // ✅ envoyer prenom au lieu de pseudo
        })
            .then(response => {
                console.log("🔍 Status de réponse:", response.status);
                if (!response.ok) throw new Error("Prénom ou mot de passe incorrect");
                return response.json();
            })

            .then(joueur => {
                console.log("🎮 Connecté :", joueur);
                alert(`Bienvenue ${joueur.prenom} !`);
                login_page.classList.add("hidden");
                cree_profil_page.classList.add("hidden"); // 👈 ajoute cette ligne
                document.body.style.backgroundColor = "#454544";
                game_home_page.classList.remove("hidden");
            })
            .catch(error => {
                console.error("❌ Erreur connexion :", error);
                alert("Identifiants invalides ou joueur non trouvé.");
            });
    });

    // ✍️ Menu Création de profil
    const formulaire_profil = document.querySelector("#cree_profil_page");

    formulaire_profil.addEventListener("submit", (event) => {
        event.preventDefault();

        const joueur = {
            nom: document.querySelector("#nom").value.trim(),
            prenom: document.querySelector("#prenom").value.trim(),
            email: document.querySelector("#email").value.trim(),
            motDePasse: document.querySelector("#mot_de_passe").value.trim()
        };

        console.log("Joueur créé :", joueur);
        formulaire_profil.classList.add("hidden");
        waiting_page.classList.remove("hidden");

        fetch("/api/joueur", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(joueur)
        })
            .then(response => {
                if (!response.ok) throw new Error("Erreur lors de la création du joueur");
                return response.text();
            })
            .then(message => {
                console.log("Réponse du serveur :", message);
                // 👉 Optionnel : afficher un message de succès
            })
            .catch(error => {
                console.error("❌ Erreur création :", error);
                alert("Erreur lors de la création du profil.");
            });
    });

    // 🚪 Transition retour vers login
    const btn_succes_cree_profil = document.querySelector("#btn_succes_cree_profil");

    btn_succes_cree_profil.addEventListener("click", () => {
        waiting_page.classList.add("hidden");
        login_page.classList.remove("hidden");
    });
});
