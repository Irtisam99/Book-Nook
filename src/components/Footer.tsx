'use client';
import Link from "next/link";
import {
  BookOpen,
  Clock3,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const exploreLinks = [
  { label: "Home", href: "/" },
  { label: "All Books", href: "/books" },
  { label: "Fiction", href: "/books?category=fiction" },
  { label: "Science", href: "/books?category=science" },
  { label: "History", href: "/books?category=history" },
  { label: "Kids", href: "/books?category=kids" },
];

const libraryLinks = [
  { label: "Add a Book", href: "/add-book" },
  { label: "My Books", href: "/my-books" },
  { label: "My Borrows", href: "/my-borrows" },
  { label: "My Profile", href: "/profile" },
];

const socialIcons = [
  { label: "X", mark: "𝕏" },
  { label: "Instagram", mark: "◎" },
  { label: "Facebook", mark: "f" },
  { label: "Pinterest", mark: "P" },
];

export default function Footer() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  return (
    <footer className="bg-footer text-footer-foreground">
      <div className="mx-auto grid w-full max-w-[1440px] gap-x-10 gap-y-12 px-6 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.85fr_0.85fr_1.15fr] lg:gap-x-12 lg:px-14 lg:py-20">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <BookOpen
              className="size-8"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <span className="font-heading text-3xl leading-none tracking-tight">
              Book<span className="text-gold italic">Nook</span>
            </span>
          </Link>
          <p className="mt-7 max-w-md text-[15px] leading-relaxed text-footer-muted">
            A curated online library for curious readers. Discover and borrow
            thoughtfully chosen books, share titles from your own shelf, and
            return to the quiet pleasure of reading.
          </p>
          <div className="mt-7 flex items-center gap-3" aria-hidden="true">
            {socialIcons.map(({ label, mark }) => (
              <span
                key={label}
                className="flex size-11 items-center justify-center rounded-full border border-footer-border font-medium text-footer-muted"
              >
                {mark}
              </span>
            ))}
          </div>
        </div>

        <nav aria-label="Explore">
          <h2 className="text-xs font-semibold tracking-[0.25em] text-gold uppercase">
            Explore
          </h2>
          <ul className="mt-6 space-y-4">
            {exploreLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-[15px] text-footer-muted transition-colors hover:text-footer-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Your library">


          <h2 className="text-xs font-semibold tracking-[0.25em] text-gold uppercase">
            Your Library
          </h2>
          {user && !isPending ? (
            <>
              <ul className="mt-6 space-y-4">
                {libraryLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[15px] text-footer-muted transition-colors hover:text-footer-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : (

            <ul className="mt-6 space-y-4">
                <li>
                  <Link
                    href={"/login"}
                    className="text-[15px] text-footer-muted transition-colors hover:text-footer-foreground"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href={"/register"}
                    className="text-[15px] text-footer-muted transition-colors hover:text-footer-foreground"
                  >
                    Become a Member
                  </Link>
                </li>
            
            </ul>

          )}
        </nav>

        <div>
          <h2 className="text-xs font-semibold tracking-[0.25em] text-gold uppercase">
            Contact
          </h2>

          <address className="mt-5 space-y-4 text-[15px] leading-relaxed text-footer-muted not-italic">
            <p className="flex items-start gap-4">
              <Mail
                className="mt-0.5 size-[18px] shrink-0 text-gold"
                aria-hidden="true"
              />
              <span>hello@booknook.example</span>
            </p>
            <p className="flex items-start gap-4">
              <Phone
                className="mt-0.5 size-[18px] shrink-0 text-gold"
                aria-hidden="true"
              />
              <span>+1 (555) 010-0142 (sample)</span>
            </p>
            <p className="flex items-start gap-4">
              <MapPin
                className="mt-0.5 size-[18px] shrink-0 text-gold"
                aria-hidden="true"
              />
              <span>Online library — no physical branch</span>
            </p>
            <p className="flex items-start gap-4">
              <Clock3
                className="mt-0.5 size-[18px] shrink-0 text-gold"
                aria-hidden="true"
              />
              <span>Borrow online, anytime</span>
            </p>
          </address>
        </div>
      </div>

      <div className="border-t border-footer-border">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-6 py-5 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left lg:px-14">
          <p className="text-sm text-footer-muted">
            © 2026 BookNook — Online Library Project. Interactive prototype
            using sample data.
          </p>
          <p className="font-heading text-sm text-footer-muted italic">
            “A room without books is like a body without a soul.” — Cicero
          </p>
        </div>
      </div>
    </footer>
  );
}
