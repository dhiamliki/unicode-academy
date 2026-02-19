UniCode Academy

UniCode Academy is a full-stack learning platform designed to provide structured programming education with real-time progress tracking, quizzes, leaderboard ranking, admin management, and secure authentication.

It combines structured courses, practical exercises, and community interaction into a modern learning experience.

-Project Overview

UniCode Academy allows users to:

Enroll in programming courses (C, Java, Python, C++, MySQL, .NET, HTML, CSS, JavaScript)

Complete lessons and quizzes

Track learning progress in real time

View leaderboard rankings

Download course attachments

Participate in live chat

Manage account settings

Admins can:

Manage users (promote/demote/delete)

Upload course attachments

Automatically notify users via email when accounts are deleted

Seed initial admin securely at startup

-Tech Stack
Backend

Java

Spring Boot

Spring Security (JWT Authentication)

PostgreSQL

JPA / Hibernate

BCrypt password hashing

Gmail SMTP (account notifications)

Frontend

React (Vite)

TypeScript

TailwindCSS

Axios (with auth interceptor)

Responsive AppShell layout

-Authentication & Security

JWT-based authentication

Role-based authorization (USER / ADMIN)

Secure password hashing (BCrypt)

Protected admin endpoints

Authenticated file downloads

SMTP-based system notifications

-Core Features

✔ Course system
✔ Lessons + quizzes
✔ Progress tracking
✔ Dashboard statistics
✔ Leaderboard ranking
✔ Admin panel
✔ Attachment management
✔ Email notifications
✔ Live chat integration

-Project Structure
backend/
unicode-frontend/

-How To Run Locally
Backend
cd backend
./mvnw spring-boot:run

Frontend
cd unicode-frontend
npm install
npm run dev

-Secure Configuration (Required)

UniCode Academy no longer stores SMTP credentials in source files.
Set the following environment variables before starting the backend:

SMTP_USERNAME
SMTP_PASSWORD
DB_PASSWORD
JWT_SECRET

Bash (Linux/macOS):
export SMTP_USERNAME=yourgmail@gmail.com
export SMTP_PASSWORD=<app_password_here>
export DB_PASSWORD=<postgres_password>
export JWT_SECRET=<your_jwt_secret>

PowerShell (Windows):
$env:SMTP_USERNAME="yourgmail@gmail.com"
$env:SMTP_PASSWORD="<app_password_here>"
$env:DB_PASSWORD="<postgres_password>"
$env:JWT_SECRET="<your_jwt_secret>"

Optional dev profile file:
Copy `backend/src/main/resources/application-dev.properties.example` to
`backend/src/main/resources/application-dev.properties` for local overrides.
This local file is git-ignored.

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
