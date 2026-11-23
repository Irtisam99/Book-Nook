"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Book = {
  _id?: string;
  id?: string;
  title?: string;
  author?: string;
  category?: string;
  image?: string;
  description?: string;
  userName?: string;
  userEmail?: string;
  totalCopies?: number;
  availableCopies?: number;
  createdAt?: string;
  addedDate?: string;
};

const categories = ["Fiction", "Science", "History", "Kids", "Others"];

function getBookId(book: Book) {
  return book._id || book.id || "";
}

function formatDate(value?: string) {
  if (!value) return "Recently added";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently added";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function MyBooksPage() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [deleteBook, setDeleteBook] = useState<Book | null>(null);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editCopies, setEditCopies] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const errorToastShown = useRef(false);

  useEffect(() => {
    document.title = "BookNook | My Books";
  }, []);

  useEffect(() => {
    if (isPending || !user?.email) return;
    const sessionEmail = user.email;

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
        if (!response.ok) throw new Error("My books could not be loaded.");
        const payload = await response.json();
        const allBooks: Book[] = Array.isArray(payload)
          ? payload
          : payload.books || [];
        const ownBooks = allBooks.filter(
          (book) =>
            book.userEmail?.toLowerCase() === sessionEmail.toLowerCase(),
        );
        if (!ignore) setBooks(ownBooks);
      } catch (error) {
        if (ignore) return;
        const message =
          error instanceof Error
            ? error.message
            : "My books could not be loaded.";
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
  }, [isPending, user?.email]);

  const firstName =
    user?.name?.trim().split(/\s+/)[0] || "Member";
  const totalCopies = books.reduce(
    (sum, book) => sum + (book.totalCopies || 0),
    0,
  );
  const availableCopies = books.reduce(
    (sum, book) =>
      sum +
      (typeof book.availableCopies === "number"
        ? book.availableCopies
        : book.totalCopies || 0),
    0,
  );
  const categoriesCount = new Set(
    books.map((book) => book.category || "Others"),
  ).size;

  function openEdit(book: Book) {
    setEditBook(book);
    setEditTitle(book.title || "");
    setEditAuthor(book.author || "");
    setEditCategory(book.category || "");
    setEditCopies(String(book.totalCopies || 1));
  }

  async function handleEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editBook) return;
    if (!editTitle.trim() || !editAuthor.trim() || !editCategory) {
      toast.error("Please complete all required book details.");
      return;
    }
    if (!Number.isInteger(Number(editCopies)) || Number(editCopies) < 1) {
      toast.error("Total copies must be at least 1.");
      return;
    }

    setIsSubmitting(true);
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(
        `${apiUrl}/books/${getBookId(editBook)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: editTitle.trim(),
            author: editAuthor.trim(),
            category: editCategory,
            totalCopies: Number(editCopies),
          }),
        },
      );
      if (!response.ok) throw new Error("The book could not be updated.");
      setBooks((current) =>
        current.map((book) =>
          getBookId(book) === getBookId(editBook)
            ? {
                ...book,
                title: editTitle.trim(),
                author: editAuthor.trim(),
                category: editCategory,
                totalCopies: Number(editCopies),
              }
            : book,
        ),
      );
      setEditBook(null);
      toast.success("Book updated successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "The book could not be updated.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteBook) return;
    setIsSubmitting(true);
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(
        `${apiUrl}/books/${getBookId(deleteBook)}`,
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error("The book could not be deleted.");
      setBooks((current) =>
        current.filter(
          (book) => getBookId(book) !== getBookId(deleteBook),
        ),
      );
      setDeleteBook(null);
      toast.success("Book deleted successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "The book could not be deleted.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-[720px] bg-background">
      <div className="mx-auto w-full max-w-[1440px] px-6 py-12 lg:px-14 lg:py-14">
        <header className="mb-10 flex items-end justify-between gap-6">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-gold" />
              <p className="text-[9px] font-semibold tracking-[0.28em] text-gold uppercase">
                {firstName}&apos;s dashboard
              </p>
            </div>
            <h1 className="font-heading text-4xl leading-none font-medium tracking-tight text-foreground sm:text-5xl">
              My Library <span className="italic text-primary">Contributions</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-6 text-muted-foreground">
              Titles you&apos;ve shared with the BookNook community. Keep your
              details up to date or retire a book from circulation.
            </p>
          </div>
          <Link
            href="/add-book"
            className="mb-1 inline-flex h-11 shrink-0 items-center gap-2 rounded-[3px] bg-primary px-5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/85"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add a Book
          </Link>
        </header>

        <div className="mb-8 grid grid-cols-2 border border-border bg-card md:grid-cols-4">
          <Stat label="Titles shared" value={String(books.length)} />
          <Stat
            label="Total copies"
            value={String(totalCopies)}
            className="border-l border-border"
          />
          <Stat
            label="On loan now"
            value={String(Math.max(totalCopies - availableCopies, 0))}
            subtitle={`${availableCopies} on the shelf`}
            className="border-t border-border md:border-t-0 md:border-l"
          />
          <Stat
            label="Categories"
            value={String(categoriesCount)}
            className="border-t border-l border-border md:border-t-0"
          />
        </div>

        {isLoading ? (
          <div className="flex min-h-80 items-center justify-center border border-border bg-card">
            <Spinner className="size-7" />
          </div>
        ) : loadError ? (
          <div className="flex min-h-80 flex-col items-center justify-center border border-border bg-card">
            <p className="font-heading text-2xl text-foreground">
              Books could not be loaded
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{loadError}</p>
          </div>
        ) : books.length === 0 ? (
          <div className="flex min-h-80 flex-col items-center justify-center border border-border bg-card text-center">
            <p className="font-heading text-2xl text-foreground">
              No contributed books yet
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Share your first title with the library.
            </p>
            <Link
              href="/add-book"
              className="mt-5 inline-flex h-10 items-center rounded-[3px] bg-primary px-5 text-xs font-semibold text-primary-foreground"
            >
              Add a Book
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden border border-border bg-card">
            <div className="hidden grid-cols-[minmax(280px,1.5fr)_minmax(120px,.6fr)_160px_180px_130px] border-b border-border px-5 py-4 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase md:grid align-center">
              <span>Book</span>
              <span>Category</span>
              <span>Total copies</span>
              <span>Available</span>
              <span className="text-right">Actions</span>
            </div>
            {books.map((book) => (
              <div
                key={getBookId(book)}
                className="grid grid-cols-1 gap-4 border-b border-border px-4 py-4 last:border-b-0 md:grid-cols-[minmax(280px,1.7fr)_minmax(120px,.7fr)_110px_150px_150px] md:items-center md:px-5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative h-16 w-12 shrink-0 overflow-hidden border border-border bg-muted">
                    {book.image ? (
                      <Image
                        src={book.image}
                        alt={book.title || "Book cover"}
                        fill
                        unoptimized
                        sizes="48px"
                        className="object-contain p-1"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-primary">
                        <span className="font-heading text-xs text-primary-foreground">
                          BN
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/books/${getBookId(book)}`}
                      className="block truncate font-heading text-base text-foreground hover:text-primary"
                    >
                      {book.title || "Untitled"}
                    </Link>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {book.author || "Unknown author"}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="border border-gold/35 px-2.5 py-1 text-[9px] font-semibold tracking-[0.16em] text-gold uppercase">
                    {book.category || "Others"}
                  </span>
                </div>
                <p className="text-sm text-foreground">
                  {book.totalCopies || 0}
                </p>
                <div>
                  <p className="text-sm text-foreground">
                    {typeof book.availableCopies === "number"
                      ? book.availableCopies
                      : book.totalCopies || 0}
                    {" "}on the shelf
                  </p>
                  <p className="mt-1 text-[9px] text-muted-foreground">
                    Added {formatDate(book.createdAt || book.addedDate)}
                  </p>
                </div>
                <div className="flex items-center gap-2 md:justify-end">
                  <button
                    type="button"
                    onClick={() => openEdit(book)}
                    className="inline-flex h-9 items-center gap-1.5 border border-border px-3 text-xs text-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <Pencil className="size-3" aria-hidden="true" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteBook(book)}
                    className="inline-flex h-9 items-center gap-1.5 border border-border px-3 text-xs text-foreground transition-colors hover:border-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-3" aria-hidden="true" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog
        open={deleteBook !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteBook(null);
        }}
      >
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this book?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes &quot;{deleteBook?.title}&quot; from the library and
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? <Spinner /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={editBook !== null}
        onOpenChange={(open) => {
          if (!open) setEditBook(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit book</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="grid gap-4">
            <label className="grid gap-2 text-xs font-semibold">
              Book title
              <input
                value={editTitle}
                onChange={(event) => setEditTitle(event.target.value)}
                className="h-11 rounded-[3px] border border-border px-3 text-sm font-normal outline-none focus:border-ring"
              />
            </label>
            <label className="grid gap-2 text-xs font-semibold">
              Author name
              <input
                value={editAuthor}
                onChange={(event) => setEditAuthor(event.target.value)}
                className="h-11 rounded-[3px] border border-border px-3 text-sm font-normal outline-none focus:border-ring"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-xs font-semibold">
                Category
                <select
                  value={editCategory}
                  onChange={(event) => setEditCategory(event.target.value)}
                  className="h-11 rounded-[3px] border border-border bg-card px-3 text-sm font-normal outline-none"
                >
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-xs font-semibold">
                Total copies
                <input
                  type="number"
                  min={1}
                  value={editCopies}
                  onChange={(event) => setEditCopies(event.target.value)}
                  className="h-11 rounded-[3px] border border-border px-3 text-sm font-normal outline-none focus:border-ring"
                />
              </label>
            </div>
            <DialogFooter>
              <button
                type="button"
                onClick={() => setEditBook(null)}
                className="h-10 border border-border px-5 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-10 bg-primary px-5 text-xs font-semibold text-primary-foreground disabled:opacity-60"
              >
                {isSubmitting ? <Spinner /> : "Save changes"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function Stat({
  label,
  value,
  subtitle,
  className = "",
}: {
  label: string;
  value: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={`h-[106px] px-7 py-6 ${className}`}>
      <p className="text-[9px] font-semibold tracking-[0.18em] text-gold uppercase">
        {label}
      </p>
      <p className="mt-3 font-heading text-2xl leading-none text-foreground">
        {value}
      </p>
      {subtitle ? (
        <p className="mt-2 text-[9px] text-muted-foreground">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
