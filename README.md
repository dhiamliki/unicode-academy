UniCode Academy

UniCode Academy is a full-stack e-learning platform built with Spring Boot, React, PostgreSQL, and JWT authentication.

It provides structured programming courses with lessons, practice editors, exercises, progress tracking, leaderboard ranking, admin management, course attachments, AI hints, and email notifications.

Demo readiness

- Enable SQL seed loading for demo data: `SPRING_SQL_INIT_MODE=always`
- Keep deferred initialization enabled with PostgreSQL seeds: `SPRING_JPA_DEFER_DATASOURCE_INITIALIZATION=true`
- Frontend and backend should stay aligned on `http://localhost:8080` unless you override both sides together
- `ANTHROPIC_API_KEY` is optional: guided help falls back to local, stable hints when the provider is not configured
- For the final demo path, prefer: login/register -> accueil -> apprendre -> lecon -> pratique -> aide guidee -> exercices -> retour accueil

Tech Stack
Backend:

- Java 17
- Spring Boot 3
- Spring Security with JWT
- Spring Data JPA
- PostgreSQL
- STOMP WebSocket
- SMTP email integration

Frontend:

- React 19 + TypeScript
- Vite
- Tailwind CSS
- React Query
- Axios
- SockJS + STOMP

Project Structure
backend/            Spring Boot REST API
unicode-frontend/   React frontend application

Documentation

- [Project audit and corrected sprint reconstruction](docs/unicode-academy-audit-and-sprint-reconstruction.md) - repository-based maturity audit, corrected 8-sprint plan, feature mapping, scope separation, and report/presentation-ready wording.

Running Locally
Backend
cd backend
./mvnw spring-boot:run

Required backend environment variables:

DB_URL=
DB_USERNAME=
DB_PASSWORD=
JWT_SECRET=
SMTP_USERNAME=
SMTP_PASSWORD=
ANTHROPIC_API_KEY= (optional)

Frontend
cd unicode-frontend
npm install
npm run dev

Frontend environment variables:

VITE_API_URL=http://localhost:8080
VITE_GOOGLE_CLIENT_ID=
VITE_WS_URL=ws://localhost:8080

Purpose

This project was built as a portfolio-level full-stack application demonstrating secure authentication, role-based authorization, clean architecture, interactive learning flows, and a modern UI.

Backend environment example

DB_URL
DB_USERNAME
DB_PASSWORD
JWT_SECRET
SMTP_USERNAME
SMTP_PASSWORD
GOOGLE_CLIENT_ID
ANTHROPIC_API_KEY

Bash (Linux/macOS):
export DB_URL=jdbc:postgresql://localhost:5432/unicode_db
export DB_USERNAME=postgres
export DB_PASSWORD=<postgres_password>
export JWT_SECRET=<your_jwt_secret>
export SMTP_USERNAME=yourgmail@gmail.com
export SMTP_PASSWORD=<app_password_here>
export GOOGLE_CLIENT_ID=<google_oauth_client_id>
export ANTHROPIC_API_KEY=<your_anthropic_api_key>

PowerShell (Windows):
$env:DB_URL="jdbc:postgresql://localhost:5432/unicode_db"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="<postgres_password>"
$env:JWT_SECRET="<your_jwt_secret>"
$env:SMTP_USERNAME="yourgmail@gmail.com"
$env:SMTP_PASSWORD="<app_password_here>"
$env:GOOGLE_CLIENT_ID="<google_oauth_client_id>"
$env:ANTHROPIC_API_KEY="<your_anthropic_api_key>"

Optional dev profile file:
Copy `backend/src/main/resources/application-dev.properties.example` to
`backend/src/main/resources/application-dev.properties` for local overrides.
This local file is git-ignored.

Frontend Google login:
Set `VITE_GOOGLE_CLIENT_ID` in your frontend environment to the same OAuth client ID.

Deployment note:
Set the same environment variables in your hosting platform secrets/config
section. Do not commit credentials to `.env`, `.properties`, or source code.

Author

Dhia Mliki
Full-Stack Developer
Project: UniCode Academy
