"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import { ImagePlus, Pencil, Plus, Trash2, TriangleAlert, X } from "lucide-react";
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
  const [editDescription, setEditDescription] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState("");
  const editFileInputRef = useRef<HTMLInputElement>(null);
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
    setEditDescription(book.description || "");
    setEditImageFile(null);
    setEditImagePreview(book.image || "");
  }

  function selectEditImage(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("The image must be smaller than 5 MB.");
      return;
    }
    if (editImagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(editImagePreview);
    }
    setEditImagePreview(URL.createObjectURL(file));
    setEditImageFile(file);
  }

  function handleEditImageChange(event: ChangeEvent<HTMLInputElement>) {
    selectEditImage(event.target.files?.[0]);
  }

  function handleEditImageDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    selectEditImage(event.dataTransfer.files?.[0]);
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
    const currentAvailable =
      typeof editBook.availableCopies === "number"
        ? editBook.availableCopies
        : editBook.totalCopies || 0;
    const onLoan = Math.max(
      (editBook.totalCopies || 0) - currentAvailable,
      0,
    );
    if (Number(editCopies) < onLoan) {
      toast.error(
        `Total copies cannot be lower than ${onLoan} because ${onLoan} copies are on loan.`,
      );
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl = editBook.image;
      if (editImageFile) {
        const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
        if (!apiKey) throw new Error("Image upload is not configured.");
        const formData = new FormData();
        formData.append("image", editImageFile);
        const uploadResponse = await fetch(
          `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
          { method: "POST", body: formData },
        );
        if (!uploadResponse.ok) {
          throw new Error("The book cover could not be uploaded.");
        }
        const uploadResult = (await uploadResponse.json()) as {
          success?: boolean;
          data?: { url?: string; display_url?: string };
        };
        imageUrl =
          uploadResult.data?.display_url || uploadResult.data?.url || imageUrl;
        if (!uploadResult.success || !imageUrl) {
          throw new Error("The image service did not return a valid URL.");
        }
      }

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
            availableCopies: Math.max(
              Number(editCopies) - onLoan,
              0,
            ),
            description: editDescription.trim(),
            image: imageUrl,
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
                availableCopies: Math.max(
                  Number(editCopies) - onLoan,
                  0,
                ),
                description: editDescription.trim(),
                image: imageUrl,
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
        <AlertDialogContent className="w-[480px] max-w-[calc(100%-2rem)] rounded-none p-0">
          <div className="border-b border-border px-7 py-6">
            <p className="mb-2 text-[9px] font-semibold tracking-[0.28em] text-gold uppercase">
              Remove from library
            </p>
            <div className="flex items-center justify-between">
              <AlertDialogTitle className="font-heading text-3xl font-medium text-foreground">
                Delete this book?
              </AlertDialogTitle>
              <AlertDialogCancel className="size-8 border-0 bg-transparent p-0 text-muted-foreground hover:bg-muted">
                <X className="size-4" />
                <span className="sr-only">Close</span>
              </AlertDialogCancel>
            </div>
          </div>

          <div className="px-7 pt-6">
            {deleteBook ? (
              <div className="flex gap-5">
                <div className="relative h-[92px] w-[68px] shrink-0 overflow-hidden border border-border bg-muted">
                  {deleteBook.image ? (
                    <Image
                      src={deleteBook.image}
                      alt={deleteBook.title || "Book cover"}
                      fill
                      unoptimized
                      sizes="68px"
                      className="object-contain p-1"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <p className="line-clamp-2 break-words font-heading text-xl leading-tight text-foreground">
                    {deleteBook.title || "Untitled"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    by {deleteBook.author || "Unknown author"}
                  </p>
                  <AlertDialogDescription className="mt-3 break-words text-xs leading-5 text-foreground/75">
                    This permanently removes the title and its details from
                    BookNook. This can&apos;t be undone.
                  </AlertDialogDescription>
                </div>
              </div>
            ) : null}

            <div className="mt-5 flex min-h-[56px] items-center gap-3 border-l-2 border-gold bg-gold/5 px-4 text-xs text-foreground/75">
              <TriangleAlert className="size-4 shrink-0 text-gold" />
              {Math.max(
                (deleteBook?.totalCopies || 0) -
                  (typeof deleteBook?.availableCopies === "number"
                    ? deleteBook.availableCopies
                    : deleteBook?.totalCopies || 0),
                0,
              )}{" "}
              copies are currently on loan. Active loans will be closed.
            </div>
          </div>

          <AlertDialogFooter className="mt-6 border-t border-border bg-transparent p-5">
            <AlertDialogCancel className="h-10 min-w-28 border border-border bg-card">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="h-10 min-w-36 bg-primary text-primary-foreground hover:bg-primary/85"
            >
              {isSubmitting ? <Spinner /> : <><Trash2 className="size-4" /> Confirm Delete</>}
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
        <DialogContent
          showCloseButton={false}
          className="flex max-h-[calc(100vh-3rem)] w-[640px] max-w-[calc(100%-2rem)] flex-col overflow-hidden rounded-none p-0"
        >
          <div className="shrink-0 border-b border-border px-7 py-5">
            <p className="mb-2 text-[9px] font-semibold tracking-[0.28em] text-gold uppercase">
              Edit book
            </p>
            <DialogHeader className="flex-row items-center justify-between">
              <DialogTitle className="font-heading text-3xl text-foreground">
                {editBook?.title || "Book"}
              </DialogTitle>
              <button
                type="button"
                onClick={() => setEditBook(null)}
                className="flex size-8 items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
                <span className="sr-only">Close</span>
              </button>
            </DialogHeader>
          </div>

          <form onSubmit={handleEdit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-7 py-6">
              <label className="grid gap-2 text-xs font-semibold text-foreground">
                Book title
                <input
                  value={editTitle}
                  onChange={(event) => setEditTitle(event.target.value)}
                  className="h-11 rounded-[3px] border border-gold/60 px-3 text-sm font-normal outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-xs font-semibold text-foreground">
                  Author name
                  <input
                    value={editAuthor}
                    onChange={(event) => setEditAuthor(event.target.value)}
                    className="h-11 rounded-[3px] border border-border px-3 text-sm font-normal outline-none focus:border-ring"
                  />
                </label>
                <label className="grid gap-2 text-xs font-semibold text-foreground">
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
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-foreground">
                  Book cover image <span className="font-normal text-muted-foreground">(optional)</span>
                </p>
                <input
                  ref={editFileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleEditImageChange}
                  className="hidden"
                />
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => editFileInputRef.current?.click()}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      editFileInputRef.current?.click();
                    }
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={handleEditImageDrop}
                  className="flex h-32 cursor-pointer flex-col items-center justify-center border border-dashed border-border bg-card px-4 text-center"
                >
                  {editImagePreview ? (
                    <div className="relative h-20 w-16">
                      <Image
                        src={editImagePreview}
                        alt="New cover preview"
                        fill
                        unoptimized
                        sizes="64px"
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <span className="flex size-9 items-center justify-center rounded-full bg-muted text-primary">
                      <ImagePlus className="size-4" />
                    </span>
                  )}
                  <p className="mt-2 text-xs font-medium text-foreground">
                    Drag an image here, or <span className="text-primary">browse</span>
                  </p>
                  <p className="mt-1 text-[9px] text-muted-foreground">
                    JPG, PNG or WebP up to 5 MB · portrait works best
                  </p>
                </div>
                {!editImageFile && (
                  <p className="mt-2 text-[9px] text-muted-foreground">
                    No image? We&apos;ll design an elegant typographic cover for you.
                  </p>
                )}
              </div>

              <label className="grid gap-2 text-xs font-semibold text-foreground">
                <span className="flex items-center justify-between">
                  <span>Short description</span>
                  <span className="font-normal text-muted-foreground">
                    {editDescription.length}/400
                  </span>
                </span>
                <textarea
                  value={editDescription}
                  maxLength={400}
                  onChange={(event) => setEditDescription(event.target.value)}
                  className="min-h-24 resize-none rounded-[3px] border border-border px-3 py-3 text-sm font-normal outline-none focus:border-ring"
                />
              </label>

              <label className="grid gap-2 text-xs font-semibold text-foreground">
                Total copies
                <input
                  type="number"
                  min={1}
                  value={editCopies}
                  onChange={(event) => setEditCopies(event.target.value)}
                  className="h-11 max-w-[285px] rounded-[3px] border border-border px-3 text-sm font-normal outline-none focus:border-ring"
                />
                <span className="text-[9px] font-normal text-muted-foreground">
                  {Math.max(
                    (editBook?.totalCopies || 0) -
                      (typeof editBook?.availableCopies === "number"
                        ? editBook.availableCopies
                        : editBook?.totalCopies || 0),
                    0,
                  )} copies are currently on loan, so total copies can&apos;t go below that number.
                </span>
              </label>
            </div>

            <DialogFooter className="shrink-0 border-t border-border bg-card p-5">
              <button
                type="button"
                onClick={() => setEditBook(null)}
                className="h-10 min-w-28 border border-border bg-card px-5 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-10 min-w-36 bg-primary px-5 text-xs font-semibold text-primary-foreground disabled:opacity-60"
              >
                {isSubmitting ? <Spinner /> : "Save Changes"}
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
