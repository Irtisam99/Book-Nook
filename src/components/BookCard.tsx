"use client";

import Image from "next/image";
import Link from "next/link";

export type BookCardData = {
  id: string;
  title: string;
  author: string;
  category: string;
  image?: string;
  availableCopies?: number;
  totalCopies?: number;
  createdAt?: string;
};

export default function BookCard({ book }: { book: BookCardData }) {
  const availableCopies =
    typeof book.availableCopies === "number"
      ? book.availableCopies
      : typeof book.totalCopies === "number"
        ? book.totalCopies
        : null;

  const totalCopies =
    typeof book.totalCopies === "number" ? book.totalCopies : null;

  return (
    <article className="flex h-[440px] flex-col border border-border bg-card p-[24px]">
      <div className="relative flex h-[218px] shrink-0 items-center justify-center overflow-hidden bg-[#f4f1e9]">
        {book.image ? (
          <div className="relative h-[176px] w-[120px]">
            <Image
              src={book.image}
              alt={book.title}
              fill
              unoptimized
              sizes="120px"
              className="object-contain"
            />
          </div>
        ) : (
          <div className="relative flex h-[176px] w-[112px] items-center justify-center bg-[#211a27] px-4 text-center shadow-[5px_6px_12px_rgba(32,28,24,0.14)]">
            <div className="absolute inset-3 border border-gold/45" />
            <div className="relative">
              <span className="mx-auto mb-4 block h-px w-5 bg-gold" />
              <p className="font-heading text-base leading-tight text-white">
                {book.title}
              </p>
              <p className="mt-3 text-[6px] tracking-[0.16em] text-gold uppercase">
                {book.author}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col pt-[18px]">
        <div className="flex items-center justify-between gap-3">
          <span className="border border-gold/35 px-2.5 py-1 text-[9px] font-semibold tracking-[0.16em] text-gold uppercase">
            {book.category || "Others"}
          </span>
          {availableCopies !== null ? (
            <span className="text-right text-[10px] text-muted-foreground">
              {availableCopies} of {totalCopies ?? availableCopies} available
            </span>
          ) : null}
        </div>

        <h2 className="mt-4 line-clamp-2 font-heading text-xl leading-tight text-foreground">
          {book.title}
        </h2>
        <p className="mt-3 text-xs text-muted-foreground">by {book.author}</p>

        <Link
          href={`/books/${book.id}`}
          className="mt-auto mb-0 flex h-[40px] items-center justify-center border border-border text-xs font-medium text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}
