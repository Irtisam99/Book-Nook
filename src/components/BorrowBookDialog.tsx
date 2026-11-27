"use client";

import Image from "next/image";
import { useState } from "react";
import { BookOpen, CalendarDays, Clock3, LibraryBig, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";
import { getTokenFromClient } from "@/lib/getTokenFromClient";

type BorrowBookDialogProps = {
  bookId: string;
  title: string;
  author: string;
  image?: string;
  availableCopies: number;
  totalCopies: number;
};

function getToday() {
  const date = new Date();
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

function getDateAfterDays(date: string, days: number) {
  const [year, month, day] = date.split("-").map(Number);
  const result = new Date(Date.UTC(year, month - 1, day + days));
  return result.toISOString().slice(0, 10);
}

export default function BorrowBookDialog({
  bookId,
  title,
  author,
  image,
  availableCopies,
  totalCopies,
}: BorrowBookDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [borrowDate] = useState(getToday);
  const [returnDate, setReturnDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const latestReturnDate = getDateAfterDays(borrowDate, 30);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user?.email) {
      toast.error("Your account details are not available. Please sign in again.");
      return;
    }
    if (!returnDate || returnDate < borrowDate || returnDate > latestReturnDate) {
      toast.error("Choose a return date within 30 days of today.");
      return;
    }

    setIsSubmitting(true);
    const token = await getTokenFromClient();
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/borrows`, {
        method: "POST",
        headers: { "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
         },
        body: JSON.stringify({
          bookId,
          bookTitle: title,
          bookImage: image || "",
          userEmail: user.email,
          borrowDate,
          returnDate,
        }),
      });

      const payload: unknown = await response.json().catch(() => null);
      const responseMessage =
        typeof payload === "object" &&
        payload !== null &&
        "message" in payload &&
        typeof payload.message === "string"
          ? payload.message
          : typeof payload === "object" &&
              payload !== null &&
              "error" in payload &&
              typeof payload.error === "string"
            ? payload.error
            : "";

      if (!response.ok) {
        if (
          response.status === 409 ||
          /already|duplicate|borrowed/i.test(responseMessage)
        ) {
          toast.error("You have already borrowed this book and have not returned it yet.");
        } else {
          toast.error(responseMessage || "The book could not be borrowed. Please try again.");
        }
        return;
      }

      toast.success("Book borrowed successfully.");
      setOpen(false);
      setReturnDate("");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "The book could not be borrowed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        disabled={availableCopies < 1}
        onClick={() => setOpen(true)}
        className="h-12 rounded-[10px] bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
      >
        {availableCopies < 1 ? "Not Available" : "Borrow This Book"}
      </button>

      <DialogContent
        showCloseButton
        className="max-h-[calc(100dvh-2rem)] max-w-[calc(100%-2rem)] gap-0 overflow-y-auto rounded-2xl border border-border bg-background p-0 sm:max-w-[520px]"
      >
        <DialogHeader className="border-b border-border px-6 py-5 pr-14">
          <p className="text-[9px] font-semibold tracking-[0.24em] text-gold uppercase">
            Confirm your loan
          </p>
          <DialogTitle className="mt-1 font-heading text-2xl font-medium text-foreground">
            Borrow this book?
          </DialogTitle>
          <DialogDescription className="text-xs leading-5 text-muted-foreground">
            Review your loan details before confirming.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-6 py-5">
          <div className="flex items-center gap-4 border border-border bg-card p-3">
            <div className="relative flex h-[88px] w-[62px] shrink-0 items-center justify-center overflow-hidden bg-[#f4f1e9]">
              {image ? (
                <Image
                  src={image}
                  alt={title}
                  fill
                  unoptimized
                  sizes="62px"
                  className="object-cover"
                />
              ) : (
                <BookOpen className="size-6 text-primary/60" aria-hidden="true" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-heading text-lg font-medium text-foreground">
                {title}
              </p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                by {author}
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 bg-gold/10 px-2.5 py-1 text-[11px] font-medium text-gold">
                <LibraryBig className="size-3.5" aria-hidden="true" />
                {availableCopies} of {totalCopies} copies available
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="borrow-date"
                className="mb-2 block text-[10px] font-semibold tracking-[0.14em] text-foreground/75 uppercase"
              >
                Borrowing date
              </label>
              <div className="relative">
                <input
                  id="borrow-date"
                  type="date"
                  value={borrowDate}
                  readOnly
                  className="h-11 w-full appearance-none border border-border bg-muted/40 px-3 pr-9 text-sm text-foreground outline-none"
                />
                <CalendarDays
                  className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="return-date"
                className="mb-2 block text-[10px] font-semibold tracking-[0.14em] text-foreground/75 uppercase"
              >
                Return date
              </label>
              <input
                id="return-date"
                type="date"
                min={borrowDate}
                max={latestReturnDate}
                value={returnDate}
                onChange={(event) => setReturnDate(event.target.value)}
                required
                className="h-11 w-full border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex min-w-0 items-start gap-2.5 border border-border px-3 py-3">
              <UserRound
                className="mt-0.5 size-4 shrink-0 text-gold"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-[9px] font-semibold tracking-[0.15em] text-muted-foreground uppercase">
                  Borrower
                </p>
                <p className="mt-1 truncate text-xs font-medium text-foreground">
                  {user?.name || "—"}
                </p>
              </div>
            </div>
            <div className="flex min-w-0 items-start gap-2.5 border border-border px-3 py-3">
              <UserRound
                className="mt-0.5 size-4 shrink-0 text-gold"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-[9px] font-semibold tracking-[0.15em] text-muted-foreground uppercase">
                  Email address
                </p>
                <p className="mt-1 truncate text-xs font-medium text-foreground">
                  {user?.email || "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 border border-gold/25 bg-gold/5 px-3.5 py-3 text-xs leading-5 text-foreground/75">
            <Clock3
              className="mt-0.5 size-4 shrink-0 text-gold"
              aria-hidden="true"
            />
            <p>
              Your loan can last up to 30 days. You can return the book early at
              any time.
            </p>
          </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border bg-muted/30 px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              className="h-10 rounded-md border border-border bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !user?.email}
              className="h-10 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Borrowing..." : "Confirm Borrow"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
