# BookNook

BookNook is a small online library for discovering books, sharing titles, and
borrowing books from other readers. Members can manage their contributed books,
track active loans, and return borrowed titles when they are finished.

**Live site:** Not deployed yet.

## Features

- Browse the library, search and filter the collection, and view book details.
- Explore a home page with a rotating book-themed banner, latest arrivals, and
  curated category sections.
- Register and sign in with email and password or Google using Better Auth.
- Add books with a cover image, category, description, and total copy count.
- Edit or remove books you contributed.
- Borrow available books, see your active loans, and return books.
- Get feedback through toast notifications and clear loading and not-found
  screens.
- Switch between light and dark themes.

## Tech Stack

- Next.js App Router, React, and TypeScript
- Tailwind CSS and Base UI components
- Better Auth with the MongoDB adapter and JWT plugin
- MongoDB-backed Express API for book and borrow data
- ImgBB for book-cover image uploads
- Swiper for the home-page banner

> The Express API is a separate service and its source is not included in this
> repository. BookNook's frontend expects it to provide the book and borrow
> endpoints listed below.

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB connection string
- A running BookNook Express API
- ImgBB API key for uploading book covers
- Google OAuth credentials if Google sign-in is enabled

### Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Create a `.env.local` file in the project root and configure:

```dotenv
BETTER_AUTH_URL=http://localhost:3000
MONGODB_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key
```

Keep credentials private. `NEXT_PUBLIC_*` variables are included in browser
code, so the ImgBB API key is exposed to visitors when used by the client.

## API Dependency

The frontend uses these endpoints on the service configured by
`NEXT_PUBLIC_API_URL`:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/books` | List books |
| `GET` | `/books/:id` | Get book details |
| `POST` | `/books` | Add a book |
| `PATCH` | `/books/:id` | Update a book |
| `DELETE` | `/books/:id` | Delete a book |
| `POST` | `/borrows` | Borrow a book |
| `GET` | `/borrows` | List borrow records |
| `DELETE` | `/borrows/:id` | Return a book |

Protected API requests send a JWT in the `Authorization` header. The API service
must validate that token and enforce authorization for the requested resource.

## Available Commands

```bash
npm run dev       # Start the development server
npm run lint      # Run ESLint
npx tsc --noEmit  # Check TypeScript types
npm run build     # Create a production build
npm run start     # Serve the production build
```

## Routes

- `/` — Home
- `/books` — Browse books
- `/books/:id` — Book details
- `/login` and `/register` — Authentication
- `/add-book` — Add a book
- `/my-books` — Manage your contributed books
- `/my-borrows` — View and return borrowed books
