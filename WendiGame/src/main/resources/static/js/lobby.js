const joueurPrenom = "Billy"; // ← à remplacer dynamiquement selon le joueur connecté
let joueurs = [];

function chargerJoueurs() {
    fetch("/api/joueur/joueurs")
        .then(res => res.json())
        .then(data => {
            joueurs = data;
            afficherJoueurs();
            afficherBoutonPretPourLeJoueurConnecte();
            document.getElementById("lobby_page").classList.remove("hidden");
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

function afficherBoutonPretPourLeJoueurConnecte() {
    const bouton = document.getElementById("readyButton");
    const joueurActuel = joueurs.find(j => j.prenom === joueurPrenom);

    if (joueurActuel && !joueurActuel.pret) {
        bouton.classList.remove("hidden");
        bouton.disabled = false;
        bouton.textContent = "Je suis prêt ✅";

        bouton.onclick = () => {
            bouton.disabled = true;
            bouton.textContent = "Chargement…";

            fetch("/api/joueur/setpret", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prenom: joueurPrenom })
            }).then(() => {
                chargerJoueurs(); // recharge localement
                bouton.classList.add("hidden");

                // facultatif : simuler une mise à jour côté autres clients
                fetch("/api/joueur/rafraichir", { method: "POST" })
                    .catch(err => console.error("Erreur de rafraîchissement global :", err));
            });
        };
    } else {
        bouton.classList.add("hidden");
    }
}

// 🔁 Mise à jour régulière
setInterval(chargerJoueurs, 5000);
chargerJoueurs();
