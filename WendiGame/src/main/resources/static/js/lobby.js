document.addEventListener("DOMContentLoaded", () => {
    sessionStorage.clear();

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
                if (!response.ok) throw new Error("Prénom ou mot de passe incorrect");
                return response.json();
            })
            .then(joueur => {
                sessionStorage.setItem("prenom", joueur.prenom);
                alert(`Bienvenue ${joueur.prenom} !`);
                login_page.classList.add("hidden");
                cree_profil_page.classList.add("hidden");
                document.body.style.backgroundColor = "#454544";
                lobby_page.classList.remove("hidden");
                chargerJoueurs();
                setInterval(chargerJoueurs, 5000);
            })
            .catch(error => {
                console.error("❌ Erreur connexion :", error);
                alert("Identifiants invalides ou joueur non trouvé.");
            });
    });

    const formulaire_profil = document.querySelector("#cree_profil_page");
    formulaire_profil.addEventListener("submit", (event) => {
        event.preventDefault();

        const joueur = {
            nom: document.querySelector("#nom").value.trim(),
            prenom: document.querySelector("#prenom").value.trim(),
            email: document.querySelector("#email").value.trim(),
            motDePasse: document.querySelector("#mot_de_passe").value.trim()
        };

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

    const btn_succes_cree_profil = document.querySelector("#btn_succes_cree_profil");
    btn_succes_cree_profil.addEventListener("click", () => {
        waiting_page.classList.add("hidden");
        login_page.classList.remove("hidden");
    });

    let joueurs = [];
    let partieEstLancee = false;

    function chargerJoueurs() {
        fetch("/api/joueur/joueurs")
            .then(res => res.json())
            .then(data => {
                joueurs = data;
                afficherJoueurs();
                afficherBoutonPretSiBilly();

                // Ne pas réafficher le lobby si la partie est déjà lancée
                if (!partieEstLancee) {
                    lobby_page.classList.remove("hidden");
                }
            })
            .catch(err => console.error("⚠️ Erreur chargement joueurs :", err));
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

    function afficherBoutonPretSiBilly() {
        const bouton = document.getElementById("readyButton");
        const joueurPrenom = sessionStorage.getItem("prenom");

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
                        partieEstLancee = true;
                        lancerCountdownPourTous();
                    })
                    .catch(err => {
                        console.error("🚫 Erreur lancement :", err);
                        bouton.textContent = "Erreur ❌";
                    });
            };
        } else {
            bouton.classList.add("hidden");
        }
    }

    function lancerCountdownPourTous() {
        document.querySelectorAll(".badge-wait").forEach(badge => {
            badge.classList.remove("badge-wait");
            badge.classList.add("badge-ready");
            badge.textContent = "Prêt";
        });

        const countdownDisplay = document.createElement("div");
        countdownDisplay.id = "countdownDisplay";
        countdownDisplay.style.fontSize = "2rem";
        countdownDisplay.style.textAlign = "center";
        countdownDisplay.style.marginTop = "20px";
        countdownDisplay.textContent = "Début dans 10...";
        document.querySelector(".status-section").appendChild(countdownDisplay);

        let timer = 10;
        const interval = setInterval(() => {
            timer--;
            countdownDisplay.textContent = `Début dans ${timer}...`;

            if (timer <= 0) {
                clearInterval(interval);
                countdownDisplay.remove();
                lobby_page.classList.add("hidden");
                game_home_page.classList.remove("hidden");
                lobby_page.style.display = "none";
            }
        }, 1000);
    }
});
