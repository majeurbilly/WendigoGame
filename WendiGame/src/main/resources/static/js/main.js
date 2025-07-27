
// 🎮 Menu de connexion
document.addEventListener("DOMContentLoaded", () => {
    const button_cree_profil = document.querySelector("#btn_cree_profil");
    const login_page = document.querySelector("#login_page");
    const cree_profil_page = document.querySelector("#cree_profil_page");

    const getCreeProfil = () => {
        login_page.classList.add("hidden");
        cree_profil_page.classList.remove("hidden");
        document.body.style.backgroundColor = "#454544"; // 💡 Changement de couleur de fond
    };

    button_cree_profil.addEventListener("click", getCreeProfil);
});
    /*===================================================================================*/

    // Menu de création de compte

    const formulaire_profil = document.querySelector("#cree_profil_page");
    const waiting_page = document.querySelector("#waiting_page");


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

    // 🌐 Envoi au backend Spring
    fetch("/api/joueur", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(joueur)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Erreur lors de la création du joueur");
            }
            return response.text();
        })
        .then(message => {
            console.log("Réponse du serveur :", message);
            // Tu pourrais afficher un message à l'utilisateur ici
        })
        .catch(error => {
            console.error("Erreur:", error);
            // Et afficher une alerte ou un message d'erreur
        });
});
/*===================================================================================*/
    // Waiting page
const btn_succes_cree_profil = document.querySelector("#btn_succes_cree_profil");
const login_page = document.querySelector("#login_page");


const succes_cree_profil = () => {
    waiting_page.classList.add("hidden");
    login_page.classList.remove("hidden");
}

btn_succes_cree_profil.addEventListener("click", succes_cree_profil);




