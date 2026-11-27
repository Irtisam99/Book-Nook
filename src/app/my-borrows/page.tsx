"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, BookOpen, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { getTokenFromClient } from "@/lib/getTokenFromClient";
import { Spinner } from "@/components/ui/spinner";

type Borrow = {
  _id?: string;
  id?: string;
  bookId?: string;
  bookTitle?: string;
  title?: string;
  bookImage?: string;
  image?: string;
  author?: string;
  userEmail?: string;
  borrowDate?: string;
  returnDate?: string;
  status?: string;
  returned?: boolean;
};

function getBorrowId(borrow: Borrow) {
  return borrow._id || borrow.id || "";
}

function getBookTitle(borrow: Borrow) {
  return borrow.bookTitle || borrow.title || "Untitled";
}

function getBookImage(borrow: Borrow) {
  return borrow.bookImage || borrow.image || "";
}

function getLocalDate(value?: string) {
  if (!value) return null;
  const dateOnly = value.slice(0, 10);
  const [year, month, day] = dateOnly.split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value?: string) {
  const date = getLocalDate(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getDayDifference(value?: string) {
  const returnDate = getLocalDate(value);
  if (!returnDate) return null;

  const today = new Date();
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const returnUtc = Date.UTC(
    returnDate.getFullYear(),
    returnDate.getMonth(),
    returnDate.getDate(),
  );
  return Math.round((returnUtc - todayUtc) / 86_400_000);
}

function isActiveBorrow(borrow: Borrow) {
  return !borrow.returned && borrow.status?.toLowerCase() !== "returned";
}

function getBorrowList(payload: unknown): Borrow[] {
  if (Array.isArray(payload)) return payload as Borrow[];
  if (typeof payload === "object" && payload !== null && "borrows" in payload) {
    const borrows = payload.borrows;
    if (Array.isArray(borrows)) return borrows as Borrow[];
  }
  throw new Error("Borrowed books could not be loaded.");
}

export default function MyBorrowsPage() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [returningId, setReturningId] = useState("");
  const errorToastShown = useRef(false);

  useEffect(() => {
    document.title = "BookNook | My Borrows";
  }, []);

  useEffect(() => {
    if (isPending || !user?.email) return;
    const email = user.email.toLowerCase();
    let ignore = false;

    async function loadBorrows() {
      setIsLoading(true);
      setLoadError("");
      const token = await getTokenFromClient();
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(`${apiUrl}/borrows`, {
          cache: "no-store",
          headers: {
            authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Borrowed books could not be loaded.");
        }

        const payload: unknown = await response.json();
        const userBorrows = getBorrowList(payload).filter(
          (borrow) =>
            borrow.userEmail?.toLowerCase() === email && isActiveBorrow(borrow),
        );
        if (!ignore) setBorrows(userBorrows);
      } catch (error) {
        if (ignore) return;
        const message =
          error instanceof Error
            ? error.message
            : "Borrowed books could not be loaded.";
        setLoadError(message);
        if (!errorToastShown.current) {
          toast.error(message);
          errorToastShown.current = true;
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void loadBorrows();
    return () => {
      ignore = true;
    };
  }, [isPending, user?.email]);

  const activeBorrows = borrows.filter(isActiveBorrow);
  const dueWithinThreeDays = activeBorrows.filter((borrow) => {
    const days = getDayDifference(borrow.returnDate);
    return days !== null && days >= 0 && days <= 3;
  });
  const nextReturn = activeBorrows
    .map((borrow) => ({
      borrow,
      days: getDayDifference(borrow.returnDate),
    }))
    .filter(
      (item): item is { borrow: Borrow; days: number } =>
        item.days !== null,
    )
    .sort((a, b) => a.days - b.days)[0]?.borrow;

  async function returnBook(borrow: Borrow) {
    const borrowId = getBorrowId(borrow);
    if (!borrowId) {
      toast.error("This borrow record is missing its ID and cannot be returned.");
      return;
    }

    setReturningId(borrowId);
    const token = await getTokenFromClient();
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(
        `${apiUrl}/borrows/${encodeURIComponent(borrowId)}`,
        { method: "DELETE" ,
          headers: {
            authorization: `Bearer ${token}`,
          }
        },
      );
      if (!response.ok) {
        const payload: unknown = await response.json().catch(() => null);
        const message =
          typeof payload === "object" &&
          payload !== null &&
          "message" in payload &&
          typeof payload.message === "string"
            ? payload.message
            : "The book could not be returned. Please try again.";
        throw new Error(message);
      }

      setBorrows((current) =>
        current.filter((item) => getBorrowId(item) !== borrowId),
      );
      toast.success(`${getBookTitle(borrow)} returned successfully.`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "The book could not be returned. Please try again.",
      );
    } finally {
      setReturningId("");
    }
  }

  const firstName = user?.name?.trim().split(/\s+/)[0] || "Member";

  return (
    <main className="min-h-[560px] bg-background">
      <section className="border-b border-border">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-6 py-10 sm:flex-row sm:items-end sm:justify-between lg:px-14 lg:py-12">
          <div>
            <p className="mb-3 flex items-center gap-2 text-[9px] font-semibold tracking-[0.28em] text-gold uppercase">
              <span className="h-px w-5 bg-gold/50" aria-hidden="true" />
              Your reading desk
            </p>
            <h1 className="font-heading text-4xl leading-tight font-medium tracking-tight text-foreground sm:text-[48px]">
              My Borrowed <span className="font-normal italic text-primary">Books</span>
            </h1>
            <p className="mt-2 max-w-[440px] text-xs leading-5 text-muted-foreground">
              Books currently on loan to you, {firstName}. Return them here when
              you’ve turned the final page.
            </p>
          </div>
          <Link
            href="/books"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 border border-border bg-background px-4 text-[11px] font-medium text-foreground transition-colors hover:bg-muted"
          >
            Browse more books
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-6 py-7 lg:px-14 lg:py-8">
        <section
          aria-label="Borrowing summary"
          className="grid gap-3 sm:grid-cols-3"
        >
          <div className="min-h-[98px] border border-border bg-card px-4 py-4">
            <p className="text-[9px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
              On loan
            </p>
            <p className="mt-2 font-heading text-2xl leading-none text-foreground">
              {isLoading ? "—" : activeBorrows.length}
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Up to 5 at a time
            </p>
          </div>
          <div className="min-h-[98px] border border-border bg-card px-4 py-4">
            <p className="text-[9px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
              Due within 3 days
            </p>
            <p className="mt-2 font-heading text-2xl leading-none text-foreground">
              {isLoading ? "—" : dueWithinThreeDays.length}
            </p>
          </div>
          <div className="min-h-[98px] border border-border bg-card px-4 py-4">
            <p className="text-[9px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
              Next return
            </p>
            <p className="mt-2 font-heading text-xl leading-none text-foreground">
              {isLoading ? "—" : nextReturn ? formatDate(nextReturn.returnDate) : "—"}
            </p>
            <p className="mt-1 truncate text-[10px] text-muted-foreground">
              {nextReturn ? getBookTitle(nextReturn) : "No upcoming returns"}
            </p>
          </div>
        </section>

        <section className="mt-5" aria-label="Borrowed books">
          {loadError ? (
            <div className="border border-border bg-card px-5 py-10 text-center">
              <p className="text-sm text-foreground">{loadError}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-3 text-xs font-medium text-primary underline underline-offset-4"
              >
                Try again
              </button>
            </div>
          ) : isLoading || isPending ? (
            <div
              className="flex min-h-80 items-center justify-center border border-border bg-card"
              aria-busy="true"
            >
              <Spinner className="size-7" />
            </div>
          ) : activeBorrows.length === 0 ? (
            <div className="border border-border bg-card px-5 py-12 text-center">
              <BookOpen
                className="mx-auto size-7 text-gold"
                aria-hidden="true"
              />
              <h2 className="mt-3 font-heading text-xl text-foreground">
                No books on loan
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                When you borrow a book, it will appear here.
              </p>
              <Link
                href="/books"
                className="mt-4 inline-flex h-9 items-center justify-center bg-primary px-4 text-xs font-medium text-primary-foreground hover:bg-primary/85"
              >
                Explore all books
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto border border-border bg-card">
              <table className="w-full min-w-[690px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-[9px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                      Book
                    </th>
                    <th className="w-[18%] px-4 py-3 text-[9px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                      Borrow date
                    </th>
                    <th className="w-[22%] px-4 py-3 text-[9px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                      Return date
                    </th>
                    <th className="w-[150px] px-4 py-3" aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {activeBorrows.map((borrow) => {
                    const borrowId = getBorrowId(borrow);
                    const daysLeft = getDayDifference(borrow.returnDate);
                    const image = getBookImage(borrow);

                    return (
                      <tr
                        key={borrowId || `${borrow.bookId}-${borrow.borrowDate}`}
                        className="border-b border-border last:border-b-0"
                      >
                        <td className="px-4 py-2.5">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="relative flex h-[52px] w-[38px] shrink-0 items-center justify-center overflow-hidden bg-[#f4f1e9]">
                              {image ? (
                                <Image
                                  src={image}
                                  alt={getBookTitle(borrow)}
                                  fill
                                  unoptimized
                                  sizes="38px"
                                  className="object-cover"
                                />
                              ) : (
                                <BookOpen
                                  className="size-4 text-primary/60"
                                  aria-hidden="true"
                                />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-heading text-sm text-foreground">
                                {getBookTitle(borrow)}
                              </p>
                              <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                                {borrow.author || "BookNook collection"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-[10px] text-foreground/80">
                          {formatDate(borrow.borrowDate)}
                        </td>
                        <td className="px-4 py-2.5">
                          <p className="text-[10px] text-foreground/90">
                            {formatDate(borrow.returnDate)}
                          </p>
                          {daysLeft !== null && (
                            <span
                              className={`mt-1 inline-flex px-1.5 py-0.5 text-[9px] ${
                                daysLeft < 0
                                  ? "bg-destructive/10 text-destructive"
                                  : daysLeft === 0
                                    ? "bg-gold/15 text-gold"
                                    : "bg-[#edf1ea] text-[#61745d]"
                              }`}
                            >
                              {daysLeft < 0
                                ? `${Math.abs(daysLeft)} ${
                                    Math.abs(daysLeft) === 1 ? "day" : "days"
                                  } overdue`
                                : daysLeft === 0
                                  ? "Due today"
                                  : `${daysLeft} ${
                                      daysLeft === 1 ? "day" : "days"
                                    } left`}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => void returnBook(borrow)}
                            disabled={!borrowId || returningId === borrowId}
                            className="inline-flex h-8 items-center justify-center gap-1.5 border border-border bg-background px-3 text-[10px] font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <RotateCcw
                              className={`size-3 ${
                                returningId === borrowId ? "animate-spin" : ""
                              }`}
                              aria-hidden="true"
                            />
                            {returningId === borrowId ? "Returning…" : "Return Book"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
