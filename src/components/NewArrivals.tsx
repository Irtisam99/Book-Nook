"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import BookCard, { type BookCardData } from "@/components/BookCard";
import { getTokenFromClient } from "@/lib/getTokenFromClient";

type RawBook = {
  _id?: string | { $oid?: string };
  id?: string;
  title?: string;
  name?: string;
  bookTitle?: string;
  author?: string;
  authorName?: string;
  category?: string;
  image?: string;
  bookImage?: string;
  coverImage?: string;
  availableCopies?: number;
  totalCopies?: number;
  createdAt?: string;
  addedDate?: string;
};

function getBookId(book: RawBook) {
  if (typeof book._id === "string") return book._id;
  if (book._id && typeof book._id === "object" && book._id.$oid) {
    return book._id.$oid;
  }
  return book.id || "";
}

function getCreatedAt(book: RawBook) {
  return book.createdAt || book.addedDate || "";
}

function normalizeBooks(payload: unknown): RawBook[] {
  if (Array.isArray(payload)) return payload as RawBook[];
  if (
    typeof payload === "object" &&
    payload !== null &&
    "books" in payload &&
    Array.isArray(payload.books)
  ) {
    return payload.books as RawBook[];
  }
  throw new Error("The latest books could not be loaded.");
}

function dateValue(value?: string) {
  if (!value) return Number.NEGATIVE_INFINITY;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
}

function toBookCardData(book: RawBook): BookCardData {
  return {
    id: getBookId(book),
    title: book.title || book.bookTitle || book.name || "Untitled",
    author: book.author || book.authorName || "Unknown author",
    category: book.category || "Others",
    image: book.image || book.bookImage || book.coverImage,
    availableCopies:
      typeof book.availableCopies === "number"
        ? book.availableCopies
        : undefined,
    totalCopies:
      typeof book.totalCopies === "number" ? book.totalCopies : undefined,
    createdAt: getCreatedAt(book),
  };
}

function BookCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex h-[440px] animate-pulse flex-col border border-border bg-card p-6"
    >
      <div className="h-[218px] shrink-0 bg-muted" />
      <div className="mt-5 h-5 w-20 bg-muted" />
      <div className="mt-4 h-6 w-4/5 bg-muted" />
      <div className="mt-3 h-4 w-3/5 bg-muted" />
      <div className="mt-auto h-10 w-full bg-muted" />
    </div>
  );
}

export default function NewArrivals() {
  const [books, setBooks] = useState<BookCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let ignore = false;

    async function loadBooks() {
      const token = await getTokenFromClient();
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(`${apiUrl}/books?limit=6`, {
          cache: "no-store",
          signal: controller.signal,
          headers: {
            authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("New arrivals could not be loaded. Please try again.");
        }

        const payload: unknown = await response.json();
        const latestBooks = normalizeBooks(payload)
          .map(toBookCardData)
          .filter((book) => book.id)
          .sort(
            (a, b) => dateValue(b.createdAt) - dateValue(a.createdAt),
          )
          .slice(0, 6);

        if (!ignore) setBooks(latestBooks);
      } catch (loadError) {
        if (ignore) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "New arrivals could not be loaded. Please try again.",
        );
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void loadBooks();
    return () => {
      ignore = true;
      controller.abort();
    };
  }, [retryCount]);

  return (
    <section
      aria-labelledby="new-arrivals-title"
      className="bg-background"
    >
      <div className="mx-auto w-full max-w-[1440px] px-6 py-14 lg:px-14 lg:py-16">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-9 bg-gold" aria-hidden="true" />
              <p className="text-[9px] font-semibold tracking-[0.28em] text-gold uppercase">
                Fresh on the shelves
              </p>
            </div>
            <h2
              id="new-arrivals-title"
              className="font-heading text-4xl font-medium tracking-tight text-foreground sm:text-5xl"
            >
              New Arrivals
            </h2>
          </div>
          <p className="text-xs text-muted-foreground sm:pb-1">
            The six most recently added titles, newest first.
          </p>
        </div>

        {isLoading ? (
          <div
            aria-label="Loading new arrivals"
            aria-busy="true"
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
          >
            {Array.from({ length: 6 }, (_, index) => (
              <BookCardSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <div
            role="alert"
            className="border border-border bg-card px-5 py-10 text-center"
          >
            <p className="text-sm text-foreground">{error}</p>
            <button
              type="button"
              onClick={() => {
                setIsLoading(true);
                setError("");
                setRetryCount((count) => count + 1);
              }}
              className="mt-3 text-xs font-medium text-primary underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        ) : books.length === 0 ? (
          <div className="border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
            No books have been added yet. Check back soon for new arrivals.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <Link
            href="/books"
            className="inline-flex h-10 items-center justify-center gap-2 border border-border bg-card px-10 py-7 text-md font-medium text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
          >
            See All Books
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
