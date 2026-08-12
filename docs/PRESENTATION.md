# WendiGo — Guide de présentation (oral)

| Élément | Détail |
|--------|--------|
| **Support interactif** | `Pre-Wendigo/index.html` (25 diapositives) |
| **Présentation orale** | ~25 min + questions |
| **Structure** | **Contenant** → **Contenu** → **Ingrédients** |

> **Règle d'or** : une diapo = une idée. Le détail va dans la bouche, pas sur l'écran.  
> **Public** : classe peu technique — commencer par « c'est quoi / pourquoi », finir par « avec quoi c'est codé ».

---

## Fil narratif (à réciter dans l'ordre)

1. **Accroche** — « Qui veut être MJ le vendredi ? Moi j'ai codé le MJ. »
2. **Plan** — « Comme une recette : le bol, le plat, les ingrédients. »
3. **Contenant** — Problème du Loup-Garou classique + promesse (tout le monde joue).
4. **Contenu** — Comment une partie tourne, la nuit, local, en ligne, **démo live**.
5. **Ingrédients** — Stack technique pour le cours (rapide, sans noyer).
6. **Questions**.

---

# ACCUEIL

## Diapositive 1 — Titre

**À l'écran :** WendiGo · Loup-Garou sans MJ · Billy Hallé · 05 juin 2026

**Oral (30 s)** : « Je présente Wendigo : un Loup-Garou qu'on joue entre amis, avec nos téléphones, sans qu'un pauvre soit coincé à animer la nuit. »

---

## Diapositive 2 — Accroche

**À l'écran :** *Qui veut être Maître du Jeu un vendredi soir ?* → *J'ai codé l'animateur.*

**Oral (45 s)** : Demander qui a déjà joué au Loup-Garou. « Vous vous rappelez : quelqu'un doit se lever la nuit, réveiller les gens un par un… Cette personne ne joue plus vraiment. Mon projet, c'est de remplacer ce rôle par un programme. »

---

## Diapositive 3 — Plan

**À l'écran :** 1 Contenant (~5 min) · 2 Contenu (~12 min) · 3 Ingrédients (~8 min)

**Oral (1 min)** : « Je ne vous noie pas tout de suite dans le code. D'abord **pourquoi** le projet existe. Ensuite **comment on joue** — et je vous fais une démo. À la fin seulement, **avec quoi c'est construit**, pour le volet technique du cours. »

---

# PARTIE 1 — LE CONTENANT

## Diapositive 4 — Rupture « Le contenant »

**À l'écran :** Plein écran — Partie 1 · Le contenant

**Oral (15 s)** : Pause. « OK, le cadre. »

---

## Diapositive 5 — Wendigo en trois mots

**À l'écran :** Un jeu · Une app web · Zéro MJ

**Oral (1 min)** :
- **Jeu** : Loup-Garou, villageois vs Wendigos, on ment, on vote, on élimine.
- **App** : tout le monde ouvre la même URL, le serveur pilote les phases.
- **Zéro MJ** : personne n'est exclu de la partie pour gérer la nuit.

« Ne confondez pas : le fun, c'est le jeu autour de la table. Le programme, c'est le travail ingrat. »

---

## Diapositive 6 — Le problème classique

**À l'écran :** 3 puces (MJ sacrifié, nuit fragile, organisation fatigante)

**Oral (1,5 min)** : Développer chaque point avec un exemple vécu. Insister : **un joueur en moins**, disputes sur la triche, règles mal appliquées quand on est fatigué.

---

## Diapositive 7 — Notre promesse

**À l'écran :** Tout le monde joue, le serveur arbitre · vibrations abandonnées · yeux ouverts · local + en ligne

**Oral (2 min)** :
- Première idée : faire vibrer le téléphone pour « ouvrir les yeux » la nuit → **abandonné** : on entend la vibration, on sait qui a une action, les disputes restent.
- **Solution** : nuit synchronisée sur l'écran, yeux ouverts, tout le monde fait quelque chose.
- **Local** = prêt. **En ligne** = en cours (2D + audio par pièce).

---

# PARTIE 2 — LE CONTENU

## Diapositive 8 — Rupture « Le contenu »

**Oral (15 s)** : « Maintenant le plat : comment on joue concrètement. »

---

## Diapositive 9 — Boucle de partie

**À l'écran :** Jour → Conseil → Bûcher → Nuit → Matin

**Oral (1 min)** : « Une partie, c'est un cycle qui tourne. Le jour on discute et on accuse. Le conseil et le bûcher, c'est la justice du village. La nuit, les pouvoirs. Le matin, on apprend qui est mort. Et on recommence. »

---

## Diapositive 10 — La nuit repensée

**À l'écran :** Cible · Prière · Immunité + capture `night.png`

**Oral (2 min)** — **diapo clé pour le public** :
- « Action de nuit » = tu choisis un joueur sur ton écran.
- Wendigos tuent, voyante inspecte, etc.
- Si tu n'as rien de spécial : tu **pries** pour quelqu'un.
- Si une personne reçoit la **majorité** des prières, elle ne peut pas mourir des Wendigos cette nuit.
- « Comme ça, tout le monde tape sur son téléphone — personne ne peut dire "lui il a eu une action secrète". »

---

## Diapositive 11 — Mode local

**À l'écran :** Table + téléphones · MVP jouable

**Oral (1 min)** : « C'est ce qu'on utilise aujourd'hui : 8 amis dans un salon, chacun son navigateur, on crie encore en vrai. L'app gère les règles. »

---

## Diapositive 12 — Mode en ligne (vision)

**À l'écran :** Maison 2D · audio par pièce · en développement

**Oral (1 min)** : « À distance, on veut la même chose : se mettre à l'écart pour chuchoter un allié. Des pièces en 2D, un canal vocal par pièce. Pas fini, mais c'est la direction. »

---

## Diapositive 13 — Démonstration

**À l'écran :** 4 étapes numérotées

**Oral (30 s)** : « Je passe à l'écran live. Si ça plante, j'ai des captures — mais normalement vous voyez une vraie partie. »

**→ DÉMO 5–8 min** (lobby, prêt, nuit ou vote, matin)

---

## Diapositive 14 — Où on en est

**À l'écran :** Tableau 4 lignes

**Oral (45 s)** : Honnête : MVP local oui, 2D en cours, cloud plus tard. « Ce n'est pas un produit commercial fini — c'est un projet cours qui joue vraiment. »

---

# PARTIE 3 — LES INGRÉDIENTS

## Diapositive 15 — Rupture « Les ingrédients »

**Oral (15 s)** : « Pour le cours : comment c'est construit. Je vais vite. »

---

## Diapositive 16 — Qui fait quoi ?

**À l'écran :** Téléphone → Serveur (juge) → Mémoire · + Connexion / Voix en bas

**Oral (1 min)** : « Trois blocs seulement. Ton téléphone : tu cliques, tu vois la phase. Le serveur Go : c'est lui qui dit "c'est la nuit", qui compte les votes, qui décide qui meurt — personne ne triche depuis son navigateur. La base : elle garde le salon. En dessous : Authentik pour se connecter, LiveKit pour parler quand on sera en ligne. La phrase à retenir : **le serveur est le juge**. »

---

## Diapositive 17 — Le serveur en Go

**À l'écran :** MJ automatique · 3 cartes (phases / synchro / tests) · bandeau des phases

**Oral (1 min)** : « On zoome sur le serveur. En Go parce que c'est fort pour le temps réel et la concurrence. **01** : il enchaîne les phases comme un animateur — salon, jour, nuit… **02** : il prévient tout le monde en même temps — pas un joueur en jour et un autre en nuit. **03** : on a des tests qui simulent des parties entières pour ne pas casser les règles en codant. Les mots techniques en bas de carte, vous n'avez pas besoin de les retenir. »

---

## Diapositive 18 — L'écran en React

**À l'écran :** Affiche et envoie · 3 cartes (UI / live / 2D) · split Menus vs Maison 2D

**Oral (1 min)** : « L'autre moitié de l'archi : ton écran. **01** : tout ce que tu vois pendant une partie — React pour les écrans. **02** : il écoute le serveur en direct — tu ne peux pas « hacker » la phase depuis le navigateur. **03** : le lobby 2D c'est un moteur à part, comme un petit jeu — on ne mélange pas ça avec les boutons de vote, sinon ça lag. En bas : deux mondes — menus React, déplacement Canvas. Le front, c'est la vitrine ; le serveur, c'est le juge. »

---

## Diapositive 19 — Connexion & voix

**Oral (45 s)** : OIDC = standard sécurité. LiveKit = WebRTC sans tout inventer.

---

## Diapositive 20 — Infra

**Oral (45 s)** : Docker pour lancer, Pulumi/Nix pour reproduire, Grafana si ça casse.

---

## Diapositive 21 — Galère

**Oral (1 min)** : Sync, règles de nuit, migration auth — une anecdote chacune.

---

## Diapositive 22 — On referait quoi ?

**À l'écran :** Grille 2×2 — Go ✓ · React ◐ · LiveKit ✓ · Authentik+Pulumi ⚖ lourd

**Oral (1 min)** : « Bilan honnête. **Go** : on referait surtout parce que c'est **léger** — sur un serveur loué, ça consomme moins de RAM/CPU qu'une grosse stack, donc ça coûte moins cher à faire tourner. En bonus, c'est bien pour le temps réel et les règles côté serveur. **React** : mitigé — menus oui, monde 2D non. **LiveKit** : oui pour la voix. **Authentik + Pulumi** : puissant mais lourd pour un projet solo. »

---

## Diapositive 23 — Projet solo, ce que j'en retiens

**À l'écran :** Bannière fierté/lucidité · 3 lignes (couper / fausse piste vibrations / choix réalistes seul)

**Oral (1 min)** : « Projet **fait tout seul** — pas de coéquipiers, pas de bande d'amis pour tester à répétition. **Fierté** : le local joue. **Lucidité** : le reste viendra. **Couper** : j'ai livré le cœur du jeu avant le 2D en ligne. **Fausse piste** : les vibrations m'ont forcé à repenser la nuit — c'est ma meilleure leçon design. **Seul** : j'ai choisi des outils que je peux héberger sans me ruiner (Go) et que je peux maintenir seul. »

---

## Diapositive 24 — Où je me suis documenté

**À l'écran :** 4 blocs — Go (Learn X in Y Minutes + go.dev/WebSocket) · React · LiveKit · Nix / Pulumi / Authentik / Grafana

**Oral (20 s)** : « Je ne lis pas la liste. En résumé : **Go** sur Learn X in Y Minutes pour démarrer vite, puis go.dev pour le serveur et les WebSockets. **React** pour l'interface. **LiveKit** pour la voix. **Nix, Pulumi, Authentik, Grafana** pour l'infra et le monitoring du cours. »

---

## Diapositive 25 — Questions

**Oral** : Préparer : « Et si quelqu'un triche ? » → serveur autoritaire. « Pourquoi pas une app mobile native ? » → web d'abord. « Ça coûte combien à héberger ? » → Docker local pour l'instant.

---

# Aide-mémoire timing (~25 min)

| Bloc | Diapos | Durée |
|------|--------|-------|
| Accueil | 1–3 | 2 min |
| **Contenant** | 4–7 | 5 min |
| **Contenu** | 8–14 | 12 min *(dont démo 5–8 min)* |
| **Ingrédients** | 15–23 | 6 min |
| Fin | 24–25 | 2 min + Q&R |

---

# Checklist avant de présenter

- [ ] Essai chronométré une fois à voix haute
- [ ] `task up` + lobby de test prêt avant la démo
- [ ] Vidéo de secours si le réseau flanche
- [ ] Raccourcis clavier : flèches / espace dans `index.html`
