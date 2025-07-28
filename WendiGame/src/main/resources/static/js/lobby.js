document.addEventListener("DOMContentLoaded", () => {
    // 🔥 DEBUG démarrage
    sessionStorage.clear(); // ← Pour éviter conflit de prénom précédent

    // 📌 Navigation vers création de compte
    const button_cree_profil = document.querySelector("#btn_cree_profil");
    const login_page = document.querySelector("#login_page");
    const cree_profil_page = document.querySelector("#cree_profil_page");
    const waiting_page = document.querySelector("#waiting_page");
    const game_home_page = document.querySelector("#game_home_page");
    const lobby_page = document.querySelector("#lobby_page");

    button_cree_profil.addEventListener("click", () => {
        login_page.classList.add("hidden");
        cree_profil_page.classList.remove("hidden");
        document.body.style.backgroundColor = "#454544";
    });

    // 🎮 Menu de Connexion
    const formulaire_login = document.querySelector("#login_page form");

    formulaire_login.addEventListener("submit", (event) => {
        event.preventDefault();

        const prenom = document.querySelector("#username").value.trim();
        const motDePasse = document.querySelector("#password").value.trim();

        fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prenom, motDePasse })
        })
            .then(response => {
                console.log("🔍 Status de réponse:", response.status);
                if (!response.ok) throw new Error("Prénom ou mot de passe incorrect");
                return response.json();
            })
            .then(joueur => {
                console.log("🎮 Connecté :", joueur);
                sessionStorage.setItem("prenom", joueur.prenom);
                console.log("✅ prenom enregistré :", sessionStorage.getItem("prenom"));
                alert(`Bienvenue ${joueur.prenom} !`);
                login_page.classList.add("hidden");
                cree_profil_page.classList.add("hidden");
                document.body.style.backgroundColor = "#454544";
                lobby_page.classList.remove("hidden");

                // ✅ Lancement du lobby après login
                chargerJoueurs();
                setInterval(chargerJoueurs, 5000);
            })
            .catch(error => {
                console.error("❌ Erreur connexion :", error);
                alert("Identifiants invalides ou joueur non trouvé.");
            });
    });

    // ✍️ Création de profil
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
            })
            .catch(error => {
                console.error("❌ Erreur création :", error);
                alert("Erreur lors de la création du profil.");
            });
    });

    // 🚪 Retour vers login
    const btn_succes_cree_profil = document.querySelector("#btn_succes_cree_profil");

    btn_succes_cree_profil.addEventListener("click", () => {
        waiting_page.classList.add("hidden");
        login_page.classList.remove("hidden");
    });

    // 🔄 Charge et affiche les joueurs
    let joueurs = [];

    function chargerJoueurs() {
       // console.log("📡 Fonction chargerJoueurs appelée !");
        fetch("/api/joueur/joueurs")
            .then(res => res.json())
            .then(data => {
                joueurs = data;
                afficherJoueurs();
                afficherBoutonPretSiBilly();
                lobby_page.classList.remove("hidden");
            })
            .catch(err => console.error("Erreur de chargement JSON :", err));
    }

    function afficherJoueurs() {
        const liste = document.getElementById("playersList");
        liste.innerHTML = "";

        joueurs.forEach(joueur => {
            const li = document.createElement("li");
            li.className = "joueur-item";

            const nom = document.createElement("span");
            nom.textContent = joueur.prenom;

            const badge = document.createElement("span");
            badge.className = joueur.pret ? "badge-ready" : "badge-wait";
            badge.textContent = joueur.pret ? "Prêt" : "En attente";

            li.appendChild(nom);
            li.appendChild(badge);
            liste.appendChild(li);
        });

        const tousPrets = joueurs.every(j => j.pret);
        const message = document.getElementById("gameStatus");
        message.textContent = tousPrets
            ? "✅ Tous les joueurs sont prêts ! La partie peut commencer 🎉"
            : "🕓 En attente que tous les joueurs soient prêts…";
    }

    // ✅ Bouton uniquement pour Billy
    function afficherBoutonPretSiBilly() {
        const bouton = document.getElementById("readyButton");
        const joueurPrenom = sessionStorage.getItem("prenom");

        // console.log("📌 afficherBoutonPretSiBilly appelée !");
       //  console.log("🎯 Valeur de sessionStorage:", joueurPrenom);

        if (joueurPrenom === "Billy") {
            bouton.classList.remove("hidden");
            bouton.disabled = false;
            bouton.textContent = "Lancer la partie 🎯";

            bouton.onclick = () => {
                bouton.disabled = true;
                bouton.textContent = "Chargement…";

                fetch("/api/joueur/lancerPartie", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ commanditaire: joueurPrenom })
                })
                    .then(() => {
                        lobby_page.classList.add("hidden");
                        game_home_page.classList.remove("hidden");
                    })
                    .catch(err => {
                        console.error("Erreur de lancement :", err);
                        bouton.textContent = "Erreur ❌";
                    });
            };
        } else {
            bouton.classList.add("hidden");
        }
    }

    // // 🧪 Test rapide pour voir ce qui est enregistré dans sessionStorage
    // setTimeout(() => {
    //     const p = sessionStorage.getItem("prenom");
    //     console.log("🔥 DEBUG prénom sessionStorage:", p);
    // }, 3000);
});
