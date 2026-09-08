<div align="center">

# 📚 GenBookZ

**Full-stack online bookstore** — browse & buy real books via the OpenLibrary API, or publish your own as an author, with role-based dashboards and a Stripe checkout.

![React](https://img.shields.io/badge/React_19-149ECA?style=flat&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![Express](https://img.shields.io/badge/Express_5-000000?style=flat&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=flat&logo=stripe&logoColor=white)
![Clerk](https://img.shields.io/badge/Clerk_Auth-6C47FF?style=flat&logo=clerk&logoColor=white)

</div>

---

## Screenshots

**Reader**

| Landing page | Home / book catalogue | Book page (reviews & Q&A) |
|---|---|---|
| ![Landing page](docs/screenshots/landing.png) | ![Home page](docs/screenshots/home.png) | ![Book reviews and Q&A](docs/screenshots/customer-comments.png) |

**Author dashboard**

| Sales analytics | Reviews | Reader comments & Q&A |
|---|---|---|
| ![Author analytics](docs/screenshots/author-analytics.png) | ![Author reviews](docs/screenshots/admin-reviews.png) | ![Author comments](docs/screenshots/author-comments.png) |

**Admin dashboard**

| Store stats | Orders | Comment moderation |
|---|---|---|
| ![Admin stats](docs/screenshots/admin-stats.png) | ![Admin orders](docs/screenshots/admin-orders.png) | ![Admin comment moderation](docs/screenshots/admin-comments.png) |

## What it does

GenBookZ is a role-based bookstore. On sign-up (Clerk), every user picks a role:

- **Reader** — search/browse books pulled live from the [OpenLibrary API](https://openlibrary.org/developers/api), add to cart, pay via Stripe, then rate/review books and ask/answer questions in a per-book forum.
- **Author** — publish and manage their own books, track sales analytics, and reply to reader comments/questions from a dedicated dashboard.
- **Admin** — moderate the platform: view store-wide stats, manage all books/orders, and remove inappropriate reviews or questions.

## Features

- 🔍 Live book search & category browsing via OpenLibrary
- 🛒 Cart, Stripe payment intents & order confirmation
- ⭐ Per-book reviews, ratings and a Q&A forum
- 👤 Role-based access (Reader / Author / Admin) enforced on both client and API
- 📊 Author analytics (sales, comments) and Admin store-wide statistics
- 🔐 Authentication & session handling via Clerk

## Tech stack

**Frontend** — React 19, Vite, React Router, Tailwind CSS 4, Framer Motion, Clerk (auth), Stripe.js, React Toastify

**Backend** — Node.js, Express 5, Prisma ORM, PostgreSQL (Neon), Stripe API

## Getting started

```bash
# Backend
cd backend
npm i
npx prisma generate
npx nodemon server.js

# Frontend
cd frontend
npm i
npm run dev
```
