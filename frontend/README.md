# TaskFlow – Full Stack Task Management System

TaskFlow is a role-based full-stack Task Management web application built with **ASP.NET Core Web API (.NET 10 LTS)**, **PostgreSQL**, and **React + TypeScript**.

## Features

### Authentication & Security
- User Registration & Login with **BCrypt** password hashing
- **JWT (JSON Web Token)** authentication
- **Role-Based Access Control (RBAC)** for `Admin` and `User`
- Global Exception Handling middleware and DTO input validation

### Admin Capabilities
- View all registered users
- Create, assign, and delete tasks
- Monitor task progress across all users

### User Capabilities
- View personally assigned tasks
- Update task status (`Pending`, `InProgress`, `Completed`)

### Frontend
- Built with **React**, **TypeScript**, and **Bootstrap 5**
- Fully responsive, mobile-first card layout with summary KPIs, search, and status filters
- Protected routes and Axios request interceptors for automatic JWT attachment

## Tech Stack
- **Backend:** C#, ASP.NET Core Web API (.NET 10 LTS), Entity Framework Core, LINQ
- **Database:** PostgreSQL, Npgsql
- **Frontend:** React.js, TypeScript, Bootstrap 5, Axios, React Router DOM
- **Tools:** Visual Studio 2026, VS Code, pgAdmin 4, Git & GitHub

## Project Structure
```text
TaskFlow/
├── backend/TaskFlow.API/   # ASP.NET Core Web API, EF Core, JWT Auth
└── frontend/               # React + TypeScript + Bootstrap UI