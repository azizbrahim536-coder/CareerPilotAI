# CareerPilot AI

CareerPilot AI est une application web de gestion et de suivi des candidatures. Elle permet de centraliser les entreprises, les offres d’emploi, les candidatures, les entretiens et les résultats dans un tableau Kanban, avec un assistant IA basé sur Gemini.

## Fonctionnalités

- Authentification sécurisée avec JWT
- Inscription et connexion utilisateur
- Gestion du profil utilisateur
- Gestion CRUD des entreprises
- Gestion CRUD des offres d’emploi
- Gestion CRUD des candidatures
- Tableau Kanban avec Drag & Drop
- Changement de statut : `SAVED`, `APPLIED`, `INTERVIEW`, `OFFER`, `REJECTED`
- Tableau de bord avec statistiques
- Prochains entretiens et prochains suivis
- Assistant IA : lettre de motivation, préparation d’entretien et analyse CV/offre

---

## Architecture

```text
CareerPilotA/
├── careerpilot-backend/      # Backend Spring Boot
├── CareerPilotFront/         # Frontend Angular
├── service.ia/               # Microservice Flask + Gemini
└── README.md
```

```text
Angular : http://localhost:4200
        |
        | JWT
        v
Spring Boot : http://localhost:8081/api
        |
        | JPA / Hibernate
        v
MySQL : CareerPilotAI

Angular
        |
        | JWT + applicationId
        v
Flask IA : http://localhost:5004
        |
        | Données candidature + offre
        v
Gemini API
```

---

## Technologies utilisées

### Frontend

- Angular
- TypeScript
- Reactive Forms
- Angular Router
- Angular CDK Drag & Drop
- HTML / CSS

### Backend

- Java
- Spring Boot
- Spring Security
- JWT
- Spring Data JPA
- Hibernate
- MySQL
- Maven

### Intelligence artificielle

- Python
- Flask
- Flask-Cors
- Google GenAI SDK
- Gemini API
- Pydantic
- Requests

---

## Prérequis

Installer :

- Java JDK compatible avec le projet
- Node.js
- Angular CLI
- Python 3
- MySQL
- Une clé API Gemini

Vérification :

```bash
java --version
node --version
npm --version
ng version
python --version
mysql --version
```

---

# 1. Configuration de MySQL

Créer la base :

```sql
CREATE DATABASE CareerPilotAI;
```

Configurer :

```text
careerpilot-backend/src/main/resources/application.properties
```

Exemple :

```properties
spring.application.name=careerpilot-backend

server.port=8081
server.servlet.context-path=/api

spring.datasource.url=jdbc:mysql://localhost:3306/CareerPilotAI?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=VOTRE_MOT_DE_PASSE

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.open-in-view=false

jwt.secret=VOTRE_CLE_JWT_TRES_LONGUE_ET_SECURISEE
jwt.expiration=86400000

spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

Ne pas publier les mots de passe ni les clés secrètes sur GitHub.

---

# 2. Lancer Spring Boot

```bat
cd "C:\Users\Ideapad Mss\Desktop\Portfolio Projects\CareerPilotA\careerpilot-backend"
mvnw.cmd spring-boot:run
```

Backend :

```text
http://localhost:8081/api
```

---

# 3. Lancer Angular

```bat
cd "C:\Users\Ideapad Mss\Desktop\Portfolio Projects\CareerPilotA\CareerPilotFront"
npm install
ng serve
```

Frontend :

```text
http://localhost:4200
```

---

# 4. Configuration du service IA

Créer ou modifier :

```text
service.ia/.env
```

```env
GEMINI_API_KEY=VOTRE_CLE_API_GEMINI
GEMINI_MODEL=gemini-3.5-flash
SPRING_API=http://localhost:8081/api
AI_PORT=5004
```

La valeur de `GEMINI_MODEL` peut être remplacée par un autre modèle disponible pour votre projet Gemini.

Le fichier `.gitignore` doit contenir :

```gitignore
venv/
.env
__pycache__/
*.pyc
.idea/
.vscode/
```

---

# 5. Lancer Flask IA

```bat
cd "C:\Users\Ideapad Mss\Desktop\Portfolio Projects\CareerPilotA\service.ia"
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Service IA :

```text
http://localhost:5004
```

Test :

```text
GET http://localhost:5004/health
```

---

## Ordre de lancement conseillé

### Terminal 1 — Spring Boot

```bat
cd "C:\Users\Ideapad Mss\Desktop\Portfolio Projects\CareerPilotA\careerpilot-backend"
mvnw.cmd spring-boot:run
```

### Terminal 2 — Flask IA

```bat
cd "C:\Users\Ideapad Mss\Desktop\Portfolio Projects\CareerPilotA\service.ia"
venv\Scripts\activate
python app.py
```

### Terminal 3 — Angular

```bat
cd "C:\Users\Ideapad Mss\Desktop\Portfolio Projects\CareerPilotA\CareerPilotFront"
ng serve
```

---

## URLs principales

| Service | URL |
|---|---|
| Frontend Angular | `http://localhost:4200` |
| Backend Spring Boot | `http://localhost:8081/api` |
| Service Flask IA | `http://localhost:5004` |
| Health IA | `http://localhost:5004/health` |

---

## Routes Angular

```text
/login
/register
/dashboard
/companies
/job-offers
/kanban
/ai-assistant
```

---

## API Authentication

### Inscription

```http
POST /api/auth/register
```

```json
{
  "firstName": "Mohamed Aziz",
  "lastName": "Brahim",
  "email": "aziz@example.com",
  "password": "MotDePasse123"
}
```

### Connexion

```http
POST /api/auth/login
```

```json
{
  "email": "aziz@example.com",
  "password": "MotDePasse123"
}
```

### Profil

```http
GET /api/users/me
Authorization: Bearer VOTRE_JWT
```

---

## API Entreprises

```http
GET    /api/companies
GET    /api/companies/{id}
POST   /api/companies
PUT    /api/companies/{id}
DELETE /api/companies/{id}
```

Exemple :

```json
{
  "name": "BionomeeX",
  "website": "https://example.com",
  "location": "Tunis, Tunisie",
  "industry": "Intelligence artificielle",
  "notes": "Entreprise spécialisée dans les solutions IA."
}
```

---

## API Offres d’emploi

```http
GET    /api/job-offers
GET    /api/job-offers?companyId={id}
GET    /api/job-offers/{id}
POST   /api/job-offers
PUT    /api/job-offers/{id}
DELETE /api/job-offers/{id}
```

Exemple :

```json
{
  "companyId": 1,
  "title": "Développeur Angular",
  "description": "Développement d’applications web.",
  "location": "Tunis",
  "workMode": "HYBRID",
  "employmentType": "FULL_TIME",
  "sourceUrl": "https://example.com/offre",
  "salaryMin": 1500,
  "salaryMax": 2500,
  "currency": "TND",
  "deadline": "2026-08-30"
}
```

---

## API Candidatures

```http
GET    /api/applications
GET    /api/applications?status=SAVED
GET    /api/applications/board
GET    /api/applications/{id}
POST   /api/applications
PUT    /api/applications/{id}
PATCH  /api/applications/{id}/status
DELETE /api/applications/{id}
```

Exemple :

```json
{
  "jobOfferId": 1,
  "status": "SAVED",
  "appliedDate": null,
  "interviewDate": null,
  "nextFollowUpDate": null,
  "contactName": null,
  "contactEmail": null,
  "contactPhone": null,
  "notes": "Candidature à préparer."
}
```

Changement de statut :

```http
PATCH /api/applications/1/status
```

```json
{
  "status": "INTERVIEW"
}
```

---

## API Tableau de bord

```http
GET /api/dashboard/statistics
```

Données retournées :

```text
totalApplications
savedApplications
appliedApplications
interviewApplications
offerApplications
rejectedApplications
activeApplications
applicationsThisMonth
responseRate
offerRate
statusDistribution
upcomingInterviews
upcomingFollowUps
recentApplications
```

---

## API Assistant IA

Toutes les routes IA nécessitent le même JWT que Spring Boot.

```http
Authorization: Bearer VOTRE_JWT
```

### Lettre de motivation

```http
POST http://localhost:5004/api/ai/cover-letter
```

```json
{
  "applicationId": 1,
  "language": "fr",
  "tone": "professional",
  "candidateSummary": "Je suis diplômé en technologies de l’informatique et je maîtrise Angular, Spring Boot, MySQL, Git et les API REST."
}
```

### Préparation entretien

```http
POST http://localhost:5004/api/ai/interview-preparation
```

```json
{
  "applicationId": 1,
  "language": "fr",
  "questionCount": 8,
  "candidateSummary": "Développeur junior maîtrisant Angular, Spring Boot, MySQL, JWT, Git et les API REST."
}
```

### Analyse CV / Offre

```http
POST http://localhost:5004/api/ai/match-analysis
```

```json
{
  "applicationId": 1,
  "language": "fr",
  "cvText": "Contenu texte complet du CV du candidat..."
}
```

---

## Valeurs disponibles

### Statut d’une candidature

```text
SAVED
APPLIED
INTERVIEW
OFFER
REJECTED
```

### Mode de travail

```text
ONSITE
HYBRID
REMOTE
```

### Type de contrat

```text
FULL_TIME
PART_TIME
INTERNSHIP
CONTRACT
FREELANCE
```

---

## Sécurité

- Mots de passe chiffrés avec BCrypt
- Routes privées protégées par JWT
- Chaque utilisateur accède uniquement à ses données
- Clé Gemini stockée uniquement dans Flask
- Le frontend ne contient pas la clé Gemini
- `.env` exclu de Git

---

## Problèmes fréquents

### `401 Unauthorized`

Vérifier le header :

```http
Authorization: Bearer JWT
```

### `404 Candidature introuvable`

L’identifiant doit appartenir à l’utilisateur connecté.

```http
GET /api/applications
```

### Gemini `429`

Le quota ou une limite de requêtes est dépassé.

- attendre la réinitialisation
- réduire les requêtes
- utiliser un autre modèle disponible
- vérifier les limites dans Google AI Studio

### Gemini `high demand`

Le modèle est temporairement surchargé.

- attendre puis réessayer
- utiliser un autre modèle disponible
- ajouter retry et fallback dans Flask

### Angular redirige vers `/dashboard`

Placer les nouvelles routes avant :

```typescript
{
  path: '**',
  redirectTo: 'dashboard'
}
```

---

## Git

```bat
git status
git add .
git commit -m "Ajout de nouvelles fonctionnalités CareerPilot"
git push
```

---

## Améliorations futures

- Upload de CV PDF
- Extraction automatique du texte du CV
- Notifications et rappels
- Envoi d’emails
- Recherche avancée
- Export des statistiques
- Historique des générations IA
- Téléchargement des lettres
- Profil candidat enrichi
- Administration des utilisateurs
- Docker
- Tests unitaires et tests d’intégration

---

## Auteur

**Mohamed Aziz Brahim**

Projet personnel Full Stack développé avec Angular, Spring Boot, MySQL, Flask et Gemini.
