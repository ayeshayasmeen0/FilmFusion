# 🎬 FilmFusion - Movie Management System

A comprehensive web application that allows users to discover, track, and manage their movie watching experience. Users can maintain watchlists, save favorites, track viewing history, and get movie details all in one centralized platform.

---

## 📋 Table of Contents

1. [Problem Statement](#problem-statement)
2. [Solution Overview](#solution-overview)
3. [Features](#features)
4. [Tech Stack](#tech-stack)
5. [Architecture](#architecture)
6. [Installation & Setup](#installation--setup)
7. [Docker Deployment](#docker-deployment)
8. [API Endpoints](#api-endpoints)
9. [Database Schema](#database-schema)
10. [Project Structure](#project-structure)
11. [Challenges Faced](#challenges-faced)
12. [Future Scope](#future-scope)
13. [Contributors](#contributors)

---

## 🎯 Problem Statement

In today's digital age, users consume content from multiple streaming platforms like Netflix, Amazon Prime, Disney+, and YouTube. The major problems faced by users include:

| Problem | Description |
|---------|-------------|
| **No Centralized Platform** | Users need to remember which movie they watched on which platform |
| **Lost Watch History** | No automatic tracking of what movies users have already watched |
| **Scattered Favorites** | Favorite movies are saved across different platforms |
| **No Watchlist Feature** | Users can't save movies they want to watch later in one place |
| **Admin Management** | No easy way for admins to add/update movie information |

### Example Scenario
> *"A user watches a movie on Netflix, saves a favorite on Amazon Prime, and adds a movie to YouTube's watchlist. They need to check three different apps to manage their movie activities."*

**Solution Need:** A single platform that acts as a centralized hub for all movie-related activities.

---

## 💡 Solution Overview

**FilmFusion** is a web-based movie management system that provides:

- **One Dashboard** for all movie activities
- **Personalized Experience** for each user
- **Admin Panel** for content management
- **Responsive Design** works on desktop, tablet, and mobile
- **Docker Support** for easy deployment anywhere

---

## ✨ Features

### 👤 User Features

| Feature | Description | Status |
|---------|-------------|--------|
| User Registration | Sign up with email and password | ✅ |
| User Login | Secure authentication system | ✅ |
| Movie Search | Search movies by title, genre, or actor | ✅ |
| Movie Details | View complete movie information (cast, rating, description) | ✅ |
| Add to Favorites | Save favorite movies to personal collection | ✅ |
| Add to Watchlist | Save movies to watch later | ✅ |
| Watch History | Auto-track movies user has watched | ✅ |
| User Dashboard | View all activities in one place | ✅ |
| Profile Management | Update personal information | ✅ |

### 👑 Admin Features

| Feature | Description | Status |
|---------|-------------|--------|
| Admin Login | Separate admin authentication | ✅ |
| Add Movie | Add new movies to database | ✅ |
| Edit Movie | Update existing movie details | ✅ |
| Delete Movie | Remove movies from system | ✅ |
| View Users | See all registered users | ✅ |
| Dashboard Analytics | View system statistics | ✅ |

### 🎨 UI Features

| Feature | Description |
|---------|-------------|
| Responsive Design | Works on all screen sizes |
| Dark Mode Support | Eye-friendly dark theme |
| Tailwind CSS | Modern, clean UI components |
| Loading States | Smooth user experience |
| Error Handling | User-friendly error messages |

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| .NET | 10.0 | Web API Framework |
| Entity Framework Core | 10.0 | ORM for database operations |
| Npgsql | 10.0.2 | PostgreSQL driver |
| ASP.NET Core Identity | 10.0 | Authentication & Authorization |

### Frontend
| Technology | Purpose |
|------------|---------|
| HTML5 | Structure |
| Tailwind CSS | Styling (Utility-first CSS framework) |
| JavaScript | Interactivity |
| Fetch API | HTTP requests to backend |

### Database
| Technology | Purpose |
|------------|---------|
| PostgreSQL | Relational database |
| pgAdmin | Database management GUI |

### DevOps & Tools
| Tool | Purpose |
|------|---------|
| Git | Version control |
| GitHub | Remote repository |
| Docker | Containerization |
| Visual Studio 2022 | IDE |

---
<img width="607" height="495" alt="image" src="https://github.com/user-attachments/assets/df7ff245-3ee1-42c0-9a8e-d7c2e3ee36a6" />

### Request Flow
1. User sends request from browser
2. API Controller receives request
3. Authentication middleware validates user
4. Service layer processes business logic
5. Entity Framework queries database
6. Response returns to client

---

## 📦 Installation & Setup

### Prerequisites

Before you begin, ensure you have the following installed:

```bash
# Check .NET version
dotnet --version   # Should show 10.0.x

# Check PostgreSQL
psql --version     # Should show 14 or higher

# Check Node.js (for Tailwind CSS)
node --version     # Should show 18 or higher

# Check Git
git --version
## 🏗️ Architecture
