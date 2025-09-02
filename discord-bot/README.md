# Bot Discord Interfaces (FR)

Ce bot crée automatiquement des salons et y poste un "container" (embed + composants v2) pour mettre en avant des interfaces de bots (affichage d'images). Le backend n'est pas nécessaire.

## Fonctionnalités
- `/setup categorie:<nom> interfaces:<liste>`: crée une catégorie, des salons par interface, et poste un container par salon
- `/addimage url:<url> titre:<texte?>`: ajoute rapidement une image dans le salon courant

## Prérequis
- Node.js 18+
- Un bot Discord (token)

## Installation
1. Copier le dossier
2. Installer les dépendances et lancer

```bash
npm install
npm run dev
```

## Scripts
- `dev`: lance le bot en TypeScript avec tsx
- `build`: compile TypeScript en JavaScript
- `start`: lance la version compilée

## Utilisation
- Inviter le bot sur votre serveur
- Taper `/setup` avec le nom de la catégorie et une liste d'interfaces
  - Exemple: `categorie: Interfaces` `interfaces: Bot A, Bot B, Bot C`
- Le bot crée les salons et poste un embed avec des boutons

## Sécurité
- Les identifiants sont hardcodés pour la démo. Supprimez/regénérez ensuite.