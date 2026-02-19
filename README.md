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

-Author :

Dhia Mliki Full-Stack Developer Project: UniCode Academy
