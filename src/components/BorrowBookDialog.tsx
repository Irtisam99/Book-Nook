"use client";

import Image from "next/image";
import { useState } from "react";
import { BookOpen, CalendarDays, Clock3, LibraryBig, UserRound } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";

type BorrowBookDialogProps = {
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

export default function BorrowBookDialog({
  title,
  author,
  image,
  availableCopies,
  totalCopies,
}: BorrowBookDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const user = session?.user;

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
                  value={getToday()}
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
            className="h-10 rounded-md border border-border bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            className="h-10 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85"
          >
            Confirm Borrow
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
