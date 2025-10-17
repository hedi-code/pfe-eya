# Documentation - Diagrammes UML

Ce dossier contient les diagrammes UML du projet de gestion de tests automatisés.

## Diagrammes disponibles

### 1. Diagramme de Classes
**Fichier:** `diagramme-classes.puml`

Ce diagramme présente l'architecture complète du système avec :
- **Services** : SupabaseService et TestService
- **Composants** : Login, Dashboard, Gestion des utilisateurs, Gestion des tests, Analyse, Standardist
- **Interfaces/Modèles** : Standardist, SelectedItem, CustomerInfo
- **Relations** entre les différentes classes

### 2. Diagrammes de Cas d'Utilisation

#### a) Vue Globale
**Fichier:** `diagramme-cas-utilisation-global.puml`

Vue d'ensemble de tous les cas d'utilisation pour tous les acteurs :
- **Administrateur** : Gestion complète du système
- **Testeur** : Gestion des tests et exécutions
- **Client** : Achat de services standardisés
- Relations et dépendances entre les cas d'utilisation

#### b) Administrateur
**Fichier:** `diagramme-cas-utilisation-administrateur.puml`

Cas d'utilisation spécifiques à l'administrateur :
- Gestion des utilisateurs (création, modification, suppression)
- Accès complet aux suites de tests
- Gestion des exécutions
- Analyse et reporting
- Navigation entre tous les modules

#### c) Testeur
**Fichier:** `diagramme-cas-utilisation-testeur.puml`

Cas d'utilisation pour le testeur :
- Création et gestion des suites de tests
- Lancement et suivi des exécutions
- Analyse des résultats
- Visualisation des statistiques
- Identification des tendances

#### d) Client
**Fichier:** `diagramme-cas-utilisation-client.puml`

Cas d'utilisation pour le client (module Standardist) :
- Consultation du catalogue de services
- Filtrage par catégorie
- Gestion du panier
- Finalisation de commande
- Génération et confirmation de facture

### 3. Diagrammes de Séquence

#### a) Authentification
**Fichier:** `diagramme-sequence-authentification.puml`

Détaille le processus d'authentification :
- Saisie des identifiants
- Validation du formulaire
- Connexion à Supabase
- Récupération du rôle utilisateur
- Redirection vers le dashboard

#### b) Gestion des Utilisateurs
**Fichier:** `diagramme-sequence-gestion-utilisateurs.puml`

Décrit les opérations de gestion des utilisateurs :
- Chargement de la liste des utilisateurs
- Ajout d'un nouvel utilisateur (création auth + profil)
- Suppression d'un utilisateur

#### c) Gestion des Tests
**Fichier:** `diagramme-sequence-gestion-tests.puml`

Illustre la gestion des suites de tests et exécutions :
- Chargement des suites de tests
- Création d'une suite de tests
- Sélection et affichage des exécutions
- Création d'une exécution de test
- Suppression de suites et exécutions

#### d) Module Standardist
**Fichier:** `diagramme-sequence-standardist.puml`

Montre le parcours d'achat de services :
- Affichage et filtrage des services
- Ajout de services au panier
- Gestion des quantités
- Finalisation de la commande
- Génération et confirmation de facture

## Visualisation des Diagrammes

### Option 1 : Extension VSCode
Installer l'extension **PlantUML** pour VSCode :
1. Ouvrir VSCode
2. Aller dans Extensions (Ctrl+Shift+X)
3. Rechercher "PlantUML"
4. Installer l'extension

Pour visualiser un diagramme :
- Ouvrir le fichier .puml
- Appuyer sur `Alt+D` pour prévisualiser

### Option 2 : PlantUML en ligne
Visiter [PlantUML Online Editor](http://www.plantuml.com/plantuml/uml/)
- Copier le contenu du fichier .puml
- Coller dans l'éditeur en ligne
- Le diagramme s'affichera automatiquement

### Option 3 : Installation locale de PlantUML
```bash
# Installer Java (requis pour PlantUML)
# Télécharger plantuml.jar depuis https://plantuml.com/fr/download

# Générer une image PNG
java -jar plantuml.jar diagramme-classes.puml

# Générer une image SVG
java -jar plantuml.jar -tsvg diagramme-classes.puml
```

## Structure du Projet

```
docs/
├── README.md                                        # Ce fichier
├── diagramme-classes.puml                           # Diagramme de classes
├── diagramme-cas-utilisation-global.puml            # Cas d'utilisation - Vue globale
├── diagramme-cas-utilisation-administrateur.puml    # Cas d'utilisation - Administrateur
├── diagramme-cas-utilisation-testeur.puml           # Cas d'utilisation - Testeur
├── diagramme-cas-utilisation-client.puml            # Cas d'utilisation - Client
├── diagramme-sequence-authentification.puml         # Séquence authentification
├── diagramme-sequence-gestion-utilisateurs.puml     # Séquence gestion utilisateurs
├── diagramme-sequence-gestion-tests.puml            # Séquence gestion tests
└── diagramme-sequence-standardist.puml              # Séquence module standardist
```

## Technologies Utilisées

- **Angular 19.2** : Framework frontend
- **Supabase** : Backend as a Service (authentification, base de données)
- **RxJS** : Programmation réactive
- **Chart.js** : Graphiques pour l'analyse
- **TailwindCSS** : Framework CSS

## Architecture du Système

### Couche Services
- **SupabaseService** : Gestion de l'authentification et session utilisateur
- **TestService** : Opérations CRUD pour profils, suites de tests, exécutions et résultats

### Couche Composants
- **LoginComponent** : Interface de connexion
- **DashboardComponent** : Tableau de bord principal
- **UsersManagementComponent** : Administration des utilisateurs
- **TesterDashboardComponent** : Interface testeur pour gérer les tests
- **TestAnalysisComponent** : Visualisation des résultats avec graphiques
- **StandardistComponent** : Module de commande de services

## Rôles et Permissions

### Administrateur
- Gestion complète des utilisateurs (CRUD)
- Accès à toutes les fonctionnalités du testeur
- Assignation des rôles
- Vue d'ensemble du système

### Testeur
- Création et gestion des suites de tests
- Lancement et suivi des exécutions
- Analyse des résultats et statistiques
- Pas d'accès à la gestion des utilisateurs

### Client
- Consultation du catalogue de services
- Commande de services de test standardisés
- Génération de factures
- Module Standardist uniquement

## Base de Données Supabase

### Tables principales
- `profiles` : Profils utilisateurs avec rôles (admin, testeur, client)
- `test_suites` : Suites de tests Selenium
- `test_executions` : Exécutions de tests
- `test_results` : Résultats détaillés des tests

## Notes Importantes

1. Les diagrammes sont au format PlantUML pour une maintenance facile
2. Tous les textes sont en français comme demandé
3. Les diagrammes reflètent l'état actuel du code source
4. Pour toute modification, mettre à jour les diagrammes en conséquence
