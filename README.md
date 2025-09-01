# 📊 Visualisateur d'Indicateurs 3D

Une application web pour créer et visualiser des données sur trois axes dans un espace 3D interactif.

## 🚀 Fonctionnalités

- **Création d'indicateurs** : Définissez vos propres axes (ex: Coût, Qualité, Rapidité)
- **Visualisation 3D interactive** : Navigation fluide avec zoom, rotation et panoramique
- **Gestion des points** : Ajoutez des points de données avec coordonnées et couleurs personnalisées
- **Interface admin** : Créez et modifiez vos indicateurs facilement
- **Responsive** : S'adapte à toutes les tailles d'écran

## 🛠️ Développement Local

### Prérequis
- Node.js (version 18 ou plus récente)
- npm

### Installation
```bash
npm install
```

### Démarrage
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Construction
```bash
npm run build
```

## 📦 Déploiement

Ce projet est configuré pour se déployer automatiquement sur **GitHub Pages** à chaque push sur la branche `main`.

### Workflow de publication :

1. **Développement local** : Modifiez et testez en local
2. **Commit & Push** : Envoyez vos changements sur GitHub
3. **Déploiement automatique** : GitHub Actions se charge du reste

```bash
git add .
git commit -m "Ajout de nouveaux indicateurs"
git push origin main
```

Le site sera mis à jour automatiquement en quelques minutes.

## 📱 Utilisation

1. **Page d'accueil** : Consultez la liste des indicateurs disponibles
2. **Visualisation** : Cliquez "Voir" pour explorer un indicateur en 3D
3. **Administration** : Cliquez "Modifier" ou "Nouvel indicateur" pour gérer vos données

### Contrôles 3D :
- **Clic gauche + glisser** : Rotation
- **Molette** : Zoom
- **Clic droit + glisser** : Déplacement

## 🎯 Structure des Données

Chaque indicateur contient :
- **3 axes** avec leurs labels (ex: "Coût", "Qualité", "Rapidité")
- **Points de données** avec coordonnées [-10, +10] et couleurs
- **Titre** descriptif

Les données sont sauvegardées dans `src/lib/data/indicators.ts`.
