UniCode Academy

UniCode Academy is a full-stack e-learning platform built with Spring Boot, React, PostgreSQL, and JWT authentication.

It provides structured programming courses with exercises, quizzes, progress tracking, leaderboard ranking, admin management, real-time chat, and email notifications.

Tech Stack
Backend :

-Java 21

-Spring Boot 3

-Spring Security with JWT

-Spring Data JPA

-PostgreSQL

-STOMP WebSocket (real-time chat)

-SMTP Email integration

Frontend :

-React + TypeScript

-TailwindCSS

-Axios

-SockJS + STOMP

-Responsive modern UI

Features

-JWT authentication (Login / Register)

-Role-based access control (USER / ADMIN)

-Course and lesson management

-Exercises and final quizzes

-User progress tracking

-Leaderboard system

-Real-time global and course chat

-Admin panel (user management, role updates, deletion)

-Course attachments (admin upload, authenticated download)

-Email notifications on account actions

Project Structure
backend/            Spring Boot REST API
unicode-frontend/   React frontend application

Running Locally
Backend
cd backend
./mvnw spring-boot:run


Required environment variables:

DB_URL=
DB_USERNAME=
DB_PASSWORD=
JWT_SECRET=
SMTP_USERNAME=
SMTP_PASSWORD=

Frontend
cd unicode-frontend
npm install
npm run dev

Purpose

This project was built as a portfolio-level full-stack application demonstrating secure authentication, role-based authorization, real-time communication, clean architecture, and modern UI design.

DB_URL
DB_USERNAME
DB_PASSWORD
JWT_SECRET
SMTP_USERNAME
SMTP_PASSWORD
GOOGLE_CLIENT_ID

Bash (Linux/macOS):
export DB_URL=jdbc:postgresql://localhost:5432/unicode_db
export DB_USERNAME=postgres
export DB_PASSWORD=<postgres_password>
export JWT_SECRET=<your_jwt_secret>
export SMTP_USERNAME=yourgmail@gmail.com
export SMTP_PASSWORD=<app_password_here>
export GOOGLE_CLIENT_ID=<google_oauth_client_id>

PowerShell (Windows):
$env:DB_URL="jdbc:postgresql://localhost:5432/unicode_db"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="<postgres_password>"
$env:JWT_SECRET="<your_jwt_secret>"
$env:SMTP_USERNAME="yourgmail@gmail.com"
$env:SMTP_PASSWORD="<app_password_here>"
$env:GOOGLE_CLIENT_ID="<google_oauth_client_id>"

Optional dev profile file:
Copy `backend/src/main/resources/application-dev.properties.example` to
`backend/src/main/resources/application-dev.properties` for local overrides.
This local file is git-ignored.

Frontend Google login:
Set `VITE_GOOGLE_CLIENT_ID` in your frontend environment to the same OAuth client ID.

Deployment note:
Set the same environment variables in your hosting platform secrets/config
section. Do not commit credentials to `.env`, `.properties`, or source code.

-Future Improvements

Production deployment

Domain integration (unicodeacademy.com)

OAuth login (Google/GitHub)

Stripe course payments

Real-time WebSocket chat

Course analytics dashboard

-Author

Dhia Mliki
Full-Stack Developer
Project: UniCode Academy
