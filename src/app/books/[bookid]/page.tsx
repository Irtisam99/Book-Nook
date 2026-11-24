import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  CalendarDays,
  ChevronRight,
  Copy,
  LibraryBig,
  UserRound,
} from "lucide-react";

import BookCard, { type BookCardData } from "@/components/BookCard";
import BorrowBookDialog from "@/components/BorrowBookDialog";

export const instant = false;

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
  pages?: number;
  publishedYear?: number;
  firstPublished?: number;
  publicationYear?: number;
  createdAt?: string;
  addedDate?: string;
};

function getBookId(book: Book) {
  return book._id || book.id || "";
}

function formatDate(value?: string) {
  if (!value) return "Recently added";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently added";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

async function getBooks(): Promise<Book[]> {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const response = await fetch(`${apiUrl}/books`, { cache: "no-store" });
  if (!response.ok) return [];
  const payload = await response.json();
  return Array.isArray(payload) ? payload : payload.books || [];
}

async function getBook(bookId: string): Promise<Book | null> {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const response = await fetch(`${apiUrl}/books/${bookId}`, {
    cache: "no-store",
  });
  if (!response.ok) return null;
  const payload = await response.json();
  return payload?.book || payload;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ bookid: string }>;
}): Promise<Metadata> {
  const { bookid } = await params;
  const book = await getBook(bookid);

  return {
    title: book?.title
      ? `BookNook | ${book.title}`
      : "BookNook | Book Details",
  };
}

export default async function BookDetailsPage({
  params,
}: {
  params: Promise<{ bookid: string }>;
}) {
  const { bookid } = await params;
  const [book, allBooks] = await Promise.all([
    getBook(bookid),
    getBooks(),
  ]);

  if (!book) notFound();

  const title = book.title || "Untitled";
  const author = book.author || "Unknown author";
  const category = book.category || "Others";
  const image = book.image;
  const description =
    book.description ||
    "A carefully selected title from the BookNook library, ready to be discovered and shared.";
  const totalCopies =
    typeof book.totalCopies === "number" ? book.totalCopies : 1;
  const availableCopies =
    typeof book.availableCopies === "number"
      ? book.availableCopies
      : totalCopies;
  const pageCount =
    typeof book.pages === "number" ? book.pages : 400;
  const publishedYear =
    typeof book.publishedYear === "number"
      ? book.publishedYear
      : typeof book.firstPublished === "number"
        ? book.firstPublished
        : typeof book.publicationYear === "number"
          ? book.publicationYear
          : 2011;

  const relatedBooks = allBooks
    .filter(
      (item) =>
        getBookId(item) !== getBookId(book) &&
        (item.category || "Others").toLowerCase() === category.toLowerCase(),
    )
    .slice(0, 3);

  const relatedFallback =
    relatedBooks.length >= 3
      ? relatedBooks
      : allBooks
          .filter((item) => getBookId(item) !== getBookId(book))
          .filter((item) => !relatedBooks.includes(item))
          .slice(0, 3 - relatedBooks.length)
          .concat(relatedBooks);

  const relatedCards: BookCardData[] = relatedFallback
    .slice(0, 3)
    .map((item) => ({
      id: getBookId(item),
      title: item.title || "Untitled",
      author: item.author || "Unknown author",
      category: item.category || "Others",
      image: item.image,
      availableCopies:
        typeof item.availableCopies === "number"
          ? item.availableCopies
          : item.totalCopies,
      totalCopies: item.totalCopies,
    }));

  return (
    <main className="min-h-[720px] bg-background">
      <div className="mx-auto w-full max-w-[1440px] px-6 lg:px-14">
        <nav
          aria-label="Breadcrumb"
          className="flex h-[44px] items-center text-[10px] text-muted-foreground"
        >
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <ChevronRight className="mx-2 size-3" aria-hidden="true" />
          <Link href="/books" className="hover:text-primary">
            All Books
          </Link>
          <ChevronRight className="mx-2 size-3" aria-hidden="true" />
          <span className="text-foreground/80">{category}</span>
          <ChevronRight className="mx-2 size-3" aria-hidden="true" />
          <span className="truncate text-foreground">{title}</span>
        </nav>

        <div className="border-t border-border py-8 lg:py-11">
          <div className="grid items-start gap-11 lg:grid-cols-[500px_minmax(0,2fr)]">
            <div className="border border-border bg-card p-3">
              <div className="relative flex h-[550px] items-center justify-center overflow-hidden bg-[#f4f1e9]">
                {image ? (
                  <div className="relative h-[500px] w-[320px] -translate-y-1 shadow-[8px_12px_18px_rgba(32,28,24,0.16)]">
                    <Image
                      src={image}
                      alt={title}
                      fill
                      unoptimized
                      sizes="580px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="relative flex h-[386px] w-[236px] items-center justify-center bg-primary px-8 text-center shadow-[8px_12px_18px_rgba(32,28,24,0.16)]">
                    <div className="absolute inset-4 border border-gold/45" />
                    <p className="font-heading text-2xl leading-tight text-primary-foreground">
                      {title}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <article className="min-w-0">
              <div className="border-b border-border pb-5">
                <div className="mb-4 flex items-center gap-3">
                  <span className="border border-gold/35 px-2.5 py-1 text-[9px] font-semibold tracking-[0.18em] text-gold uppercase">
                    {category}
                  </span>
                  <span className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
                    <span className="size-1.5 rounded-full bg-gold" />
                    Available to borrow
                  </span>
                </div>
                <h1 className="font-heading text-4xl leading-none font-medium tracking-tight text-foreground sm:text-[50px]">
                  {title}
                </h1>
                <p className="mt-3 text-xs text-muted-foreground">
                  by <span className="font-medium text-foreground/70">{author}</span>
                </p>
              </div>

              <p className="mt-5 text-[15px] leading-6 text-foreground/75">
                <span className="float-left mr-1.5 -mt-1 font-heading text-[42px] leading-[42px] text-primary">
                  {description.charAt(0).toUpperCase()}
                </span>
                {description.slice(1)}
              </p>

              <div className="bg-white mt-10 grid overflow-hidden border border-border sm:grid-cols-2">
                <div className="flex min-h-[84px] items-center gap-3 border-b border-border px-4 sm:border-r sm:border-b">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
                    <UserRound className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold tracking-[0.16em] text-gold uppercase">
                      Added by
                    </p>
                    <p className="truncate text-sm font-medium text-foreground">
                      {book.userName || "BookNook member"}
                    </p>
                    <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                      {book.userEmail || "Member"}
                    </p>
                  </div>
                </div>

                <div className="flex min-h-[84px] items-center gap-3 border-b border-border px-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
                    <Copy className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[12px] font-semibold tracking-[0.16em] text-gold uppercase">
                      Available copies
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {availableCopies} <span className="text-muted-foreground">/ {totalCopies}</span>
                    </p>
                    <div className="mt-2 h-1 w-full overflow-hidden bg-muted">
                      <div
                        className="h-full bg-gold"
                        style={{
                          width: `${totalCopies > 0 ? (availableCopies / totalCopies) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex min-h-[84px] items-center gap-3 border-b border-border px-4 sm:border-r sm:border-b">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
                    <CalendarDays className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[12px] font-semibold tracking-[0.16em] text-gold uppercase">
                      Added
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {formatDate(book.createdAt || book.addedDate)}
                    </p>
                  </div>
                </div>

                <div className="flex min-h-[84px] items-center gap-3 border-b border-border px-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
                    <LibraryBig className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[12px] font-semibold tracking-[0.16em] text-gold uppercase">
                      Pages
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {pageCount} pages
                    </p>
                  </div>
                </div>

                <div className="flex min-h-[84px] items-center gap-3 border-border px-4 sm:border-r sm:border-r-border">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
                    <LibraryBig className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[12px] font-semibold tracking-[0.16em] text-gold uppercase">
                      Total copies
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {totalCopies} total copies
                    </p>
                  </div>
                </div>

                <div className="flex min-h-[84px] items-center gap-3 px-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
                    <CalendarDays className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[12px] font-semibold tracking-[0.16em] text-gold uppercase">
                      First published
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {publishedYear}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-4">
                <BorrowBookDialog
                  bookId={getBookId(book)}
                  title={title}
                  author={author}
                  image={image}
                  availableCopies={availableCopies}
                  totalCopies={totalCopies}
                />
              </div>
            </article>
          </div>
        </div>

        {relatedCards.length > 0 ? (
          <section className="border-t border-border py-8 lg:py-9">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="mb-3 text-[9px] font-semibold tracking-[0.28em] text-gold uppercase">
                  You may also enjoy
                </p>
                <h2 className="font-heading text-3xl font-medium text-foreground">
                  Related Books
                </h2>
              </div>
              <Link
                href={`/books?category=${encodeURIComponent(category)}`}
                className="mb-1 text-xs font-medium text-foreground/70 hover:text-primary"
              >
                More in {category} →
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedCards.map((item) => (
                <BookCard key={item.id} book={item} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
