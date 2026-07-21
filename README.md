# Mada Farm

Dashboard de gestion pour une ferme avicole (Fort Dauphin, Madagascar) : journal quotidien, œufs, poussins, nourriture & eau, santé, mortalité, clients, factures, trésorerie, construction & équipement, plan d'affaires, rapports. Bilingue FR/EN.

## Stack

Next.js 16 (App Router) + Prisma/PostgreSQL (Neon) + NextAuth + Tailwind v4.

## Lancer le projet en local

1. Copier les variables d'environnement (`DATABASE_URL` vers la base Neon partagée, `NEXTAUTH_SECRET`, etc.) dans `.env`.
2. Installer les dépendances :
   ```bash
   npm install
   ```
3. Lancer le serveur de développement :
   ```bash
   npm run dev
   ```
4. Ouvrir [http://localhost:3000](http://localhost:3000) et se connecter avec un compte existant (Admin ou Staff).

Le serveur local et la production (Vercel) partagent la même base de données Neon — toute donnée créée en local apparaît aussi en production, et vice-versa.

## Journal quotidien

Le module **Journal quotidien** (`/journal`) regroupe en une seule saisie par jour : œufs ramassés, mortalité + cause, provende utilisée, poules malades/isolées, ventes (œufs/poussins, montant en € et en Ar), météo et notes. Chaque champ est optionnel — seuls les champs remplis créent une entrée dans les modules concernés (Œufs, Mortalité, Nourriture & Eau, Santé, Trésorerie), qui restent consultables/modifiables individuellement comme avant.

**Pour tester en local :**
1. Créer d'abord un troupeau sur `/flocks` si aucun n'existe.
2. Aller sur `/journal`, remplir la date + le troupeau, puis un ou plusieurs champs (par ex. 20 œufs, 1 perte avec cause "maladie").
3. Enregistrer — vérifier que l'entrée apparaît dans l'historique du journal, et que les modules Œufs/Mortalité correspondants sont bien à jour.
4. Sur le tableau de bord (`/`), une alerte rouge apparaît automatiquement si plus de 3 volailles sont perdues le jour même.
5. Cliquer sur "Exporter en CSV" pour télécharger l'historique complet du journal.
6. Cliquer sur "Modifier" sur une ligne de l'historique pour corriger une entrée (le troupeau n'est pas modifiable après coup, seuls les chiffres le sont).

## Plan d'action (tableau type Monday)

Le module **Plan d'action** (`/tasks`) suit le lancement de la ferme phase par phase (5 groupes pré-remplis : Avant l'arrivée, Arrivée & finitions, Arrivée des poussins, Élevage & pré-vente, Ponte & premières ventes), avec pour chaque tâche : responsable(s) (Alix / Copine / Employé / Local), statut (À faire / En cours / Fait / Bloqué, code couleur gris/bleu/vert/rouge), priorité (Haute/Moyenne/Basse), échéance libre et notes. Une barre de progression par phase indique le % de tâches faites.

Les données de démarrage (les 31 tâches fournies) sont déjà chargées dans la base partagée — pas besoin de les re-saisir.

**Pour tester en local :**
1. Aller sur `/tasks` — les 5 phases pré-remplies doivent apparaître avec leurs tâches et leur barre de progression.
2. Changer le statut d'une tâche via le menu déroulant coloré à droite de la ligne — la barre de progression de la phase se met à jour immédiatement.
3. Filtrer par responsable ou par statut en haut du tableau.
4. Ajouter une tâche via le formulaire en haut de page, puis cliquer sur son titre pour la modifier ou la supprimer.
5. Cliquer sur "Exporter en CSV" pour télécharger tout le plan d'action.

Le mode hors-ligne (PWA, IndexedDB, synchronisation) n'est pas encore construit pour ce module ni pour le Journal quotidien — c'est la prochaine étape.

## Prisma

```bash
npx prisma migrate dev   # appliquer un changement de schéma
npx prisma studio        # explorer la base de données
npm run seed              # créer un compte admin par défaut si la base est vide
```
