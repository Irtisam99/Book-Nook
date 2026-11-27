import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <main className="flex min-h-[720px] flex-col items-center justify-center bg-background px-6 text-center">
      <p className="text-xs font-semibold tracking-[0.24em] text-gold uppercase">
        404 — Page not found
      </p>
      <h1 className="mt-4 font-heading text-4xl font-medium text-foreground sm:text-5xl">
        This page isn’t on our shelves.
      </h1>
      <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
        The page may have moved, or the address may be incorrect.
      </p>
      <Link
        href="/"
        className="mt-7 inline-flex h-11 items-center justify-center bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85"
      >
        Back to Home
      </Link>
    </main>
  );
}
