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
