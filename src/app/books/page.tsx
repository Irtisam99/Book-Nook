"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { toast } from "sonner";

import BookCard, {
  type BookCardData,
} from "@/components/BookCard";
import { Spinner } from "@/components/ui/spinner";

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

const categories = ["All", "Fiction", "Science", "History", "Kids", "Others"];

function normalizeBooks(payload: unknown): RawBook[] {
  if (Array.isArray(payload)) return payload as RawBook[];
  if (
    payload &&
    typeof payload === "object" &&
    "books" in payload &&
    Array.isArray((payload as { books: unknown }).books)
  ) {
    return (payload as { books: RawBook[] }).books;
  }
  return [];
}

function getBookId(book: RawBook) {
  if (typeof book._id === "string") return book._id;
  if (book._id && typeof book._id === "object" && book._id.$oid) {
    return book._id.$oid;
  }
  return book.id || "";
}

function AllBooksPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedCategory = searchParams.get("category");
  const category =
    categories.find(
      (item) => item.toLowerCase() === requestedCategory?.toLowerCase(),
    ) || "All";
  const [books, setBooks] = useState<BookCardData[]>([]);
  const [search, setSearch] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sort, setSort] = useState("Newest arrivals");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const errorToastShown = useRef(false);

  useEffect(() => {
    document.title = "BookNook | All Books";
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadBooks() {
      setIsLoading(true);
      setLoadError("");
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(`${apiUrl}/books`, {
          cache: "no-store",
        });

        if (!response.ok) throw new Error("The books could not be loaded.");

        const payload = await response.json();
        const normalized = normalizeBooks(payload).map((book) => ({
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
          createdAt: book.createdAt || book.addedDate,
        }));

        if (!ignore) setBooks(normalized);
      } catch (error) {
        if (ignore) return;
        const message =
          error instanceof Error
            ? error.message
            : "The books could not be loaded.";
        setLoadError(message);
        if (!errorToastShown.current) {
          toast.error(message);
          errorToastShown.current = true;
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadBooks();
    return () => {
      ignore = true;
    };
  }, []);

  const categoryCounts = categories.reduce<Record<string, number>>(
    (counts, item) => {
      counts[item] =
        item === "All"
          ? books.length
          : books.filter(
              (book) =>
                book.category.toLowerCase() === item.toLowerCase(),
            ).length;
      return counts;
    },
    {},
  );

  const visibleBooks = books
    .filter((book) => {
      const matchesSearch =
        `${book.title} ${book.author}`
          .toLowerCase()
          .includes(search.trim().toLowerCase());
      const matchesCategory =
        category === "All" ||
        book.category.toLowerCase() === category.toLowerCase();
      const matchesAvailability =
        !availableOnly ||
        (typeof book.availableCopies === "number"
          ? book.availableCopies > 0
          : true);
      return matchesSearch && matchesCategory && matchesAvailability;
    })
    .sort((a, b) => {
      if (sort === "Title A-Z") return a.title.localeCompare(b.title);
      if (sort === "Author A-Z") return a.author.localeCompare(b.author);
      return (
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
      );
    });

  return (
    <main className="min-h-[720px] bg-background">
      <div className="mx-auto w-full max-w-[1440px] px-6 py-10 lg:px-14 lg:py-12">
        <header className="grid items-end gap-6 pb-9 sm:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-gold" />
              <p className="text-[9px] font-semibold tracking-[0.28em] text-gold uppercase">
                All books
              </p>
            </div>
            <h1 className="font-heading text-4xl leading-none font-medium tracking-tight text-foreground sm:text-5xl">
              Explore Our <span className="italic text-primary">Collection</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-6 text-muted-foreground">
              Browse every title on our shelves — from Victorian classics to
              contemporary science. Search by title or author, or filter by
              category.
            </p>
          </div>

          <label className="relative block">
            <Search
              className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="sr-only">Search books</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search titles, authors..."
              className="h-12 w-full border border-border bg-card pr-4 pl-11 text-sm outline-none placeholder:text-muted-foreground/65 focus:border-ring"
            />
          </label>
        </header>

        <div className="border-t border-border pt-8">
          <div className="flex flex-col gap-5 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    router.replace(
                      item === "All"
                        ? "/books"
                        : `/books?category=${encodeURIComponent(item.toLowerCase())}`,
                      { scroll: false },
                    )
                  }
                  className={`h-9 rounded-full px-4 text-xs font-medium transition-colors ${
                    category === item
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-card text-foreground hover:border-primary/40"
                  }`}
                >
                  {item}
                  <span
                    className={`ml-2 ${
                      category === item
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {categoryCounts[item]}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 lg:justify-end">
              <label className="flex cursor-pointer items-center gap-3 text-xs text-foreground/80">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(event) => setAvailableOnly(event.target.checked)}
                  className="peer sr-only"
                />
                <span className="relative h-5 w-9 rounded-full bg-muted-foreground/25 transition-colors peer-checked:bg-primary after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-card after:shadow-sm after:transition-transform peer-checked:after:translate-x-4" />
                Available now
              </label>

              <label className="flex items-center gap-3 text-xs text-foreground/80">
                <span>Sort:</span>
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className="h-9 border border-border bg-card px-3 text-xs outline-none focus:border-ring"
                >
                  <option>Newest arrivals</option>
                  <option>Title A-Z</option>
                  <option>Author A-Z</option>
                </select>
              </label>
            </div>
          </div>

          <p className="py-5 text-xs text-muted-foreground">
            Showing {visibleBooks.length} {visibleBooks.length === 1 ? "title" : "titles"}
          </p>

          {isLoading ? (
            <div className="flex min-h-80 items-center justify-center">
              <Spinner className="size-7" />
            </div>
          ) : loadError ? (
            <div className="flex min-h-80 flex-col items-center justify-center border border-border bg-card text-center">
              <p className="font-heading text-2xl text-foreground">
                Books could not be loaded
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{loadError}</p>
            </div>
          ) : visibleBooks.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center border border-border bg-card text-center">
              <p className="font-heading text-2xl text-foreground">
                No books found
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try another search or category.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 pb-12 sm:grid-cols-2 lg:grid-cols-3">
              {visibleBooks.map((book) => (
                <BookCard key={book.id || book.title} book={book} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function AllBooksPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[720px] items-center justify-center bg-background">
          <Spinner className="size-7" />
        </main>
      }
    >
      <AllBooksPageContent />
    </Suspense>
  );
}
