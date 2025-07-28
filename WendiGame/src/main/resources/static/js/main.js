document.addEventListener("DOMContentLoaded", () => {
    sessionStorage.clear();

    const button_cree_profil = document.querySelector("#btn_cree_profil");
    const login_page = document.querySelector("#login_page");
    const cree_profil_page = document.querySelector("#cree_profil_page");
    const waiting_page = document.querySelector("#waiting_page");
    const game_home_page = document.querySelector("#game_home_page");
    const lobby_page = document.querySelector("#lobby_page");

    let joueurs = [];
    let partieEstLancee = false;
    let countdownEstEnCours = false;

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
            .then(res => res.ok ? res.json() : Promise.reject("Identifiants incorrects"))
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
            .catch(err => {
                console.error("❌ Connexion échouée :", err);
                alert("Prénom ou mot de passe incorrect.");
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

        fetch("/api/joueur", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(joueur)
        })
            .then(res => res.ok ? res.text() : Promise.reject("Erreur création"))
            .then(() => {
                formulaire_profil.classList.add("hidden");
                waiting_page.classList.remove("hidden");
            })
            .catch(err => {
                console.error("❌ Erreur création :", err);
                alert("Impossible de créer le profil.");
            });
    });

    document.querySelector("#btn_succes_cree_profil").addEventListener("click", () => {
        waiting_page.classList.add("hidden");
        login_page.classList.remove("hidden");
    });

    function chargerJoueurs() {
        fetch("/api/joueur/joueurs")
            .then(res => res.json())
            .then(data => {
                joueurs = data;
                afficherJoueurs();
                afficherBoutonPretSiBilly();

                fetch("/api/joueur/etatPartie")
                    .then(res => res.json())
                    .then(info => {
                        if (info.estLancee && !partieEstLancee && !countdownEstEnCours) {
                            partieEstLancee = true;
                            countdownEstEnCours = true;
                            lancerCountdownPourTous();
                        }
                    });

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
                        countdownEstEnCours = true;
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
        countdownDisplay.style.fontSize = "2.5rem";
        countdownDisplay.style.textAlign = "center";
        countdownDisplay.style.margin = "30px auto";
        countdownDisplay.style.padding = "15px";
        countdownDisplay.style.color = "#ffffff";
        countdownDisplay.style.backgroundColor = "#222";
        countdownDisplay.style.borderRadius = "10px";
        countdownDisplay.style.width = "fit-content";

        const statusSection = document.querySelector(".status-section");
        if (statusSection && !document.getElementById("countdownDisplay")) {
            statusSection.appendChild(countdownDisplay);
        } else {
            console.warn("⚠️ .status-section manquant ou compteur déjà affiché");
        }

        let timer = 10;
        countdownDisplay.textContent = `Début dans ${timer}...`;

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
