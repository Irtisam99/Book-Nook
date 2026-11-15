"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Menu } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ThemeToggle from "@/components/theme-toggle";
import { cn } from "cn";

const links = [
  { label: "Home", href: "/" },
  { label: "All Books", href: "/books" },
  { label: "Add Book", href: "/add-book" },
  { label: "My Books", href: "/my-books" },
  { label: "My Borrows", href: "/my-borrows" },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <BookOpen
        className="size-7 text-primary"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <span className="font-heading text-[1.6rem] leading-none font-semibold tracking-tight text-foreground">
        Book<span className="text-primary italic">Nook</span>
      </span>
    </Link>
  );
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

// TODO(auth): Login/Register render for everyone for now. When BetterAuth
// lands, swap these for the session-aware avatar dropdown.
export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkClass = (href: string) =>
    cn(
      "relative text-[15px] font-medium transition-colors hover:text-primary",
      isActivePath(pathname, href)
        ? "text-foreground after:absolute after:-bottom-2 after:left-0 after:h-px after:w-full after:bg-gold after:content-['']"
        : "text-foreground/70",
    );

  return (
    <header className="relative z-50 bg-background">
      <div className="mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between px-6 lg:px-14">
        <Logo />

        <nav
          aria-label="Main navigation"
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-9 lg:flex"
        >
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={linkClass(link.href)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop auth */}
        <div className="hidden items-center gap-6 lg:flex">
          <ThemeToggle />
          <Link
            href="/login"
            className="text-[15px] font-medium text-foreground transition-colors hover:text-primary"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="inline-flex h-11 items-center rounded-md bg-primary px-7 text-[15px] font-medium text-primary-foreground transition-colors hover:bg-primary/85"
          >
            Register
          </Link>
        </div>

        {/* Mobile menu */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              aria-label="Open menu"
              className="flex size-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted"
            >
              <Menu className="size-5" aria-hidden="true" />
            </SheetTrigger>
            <SheetContent side="right" className="gap-0 p-0">
              <SheetHeader className="border-b border-border">
                <SheetTitle className="flex items-center gap-2">
                  <BookOpen
                    className="size-6 text-primary"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <span className="font-heading text-xl font-semibold">
                    Book<span className="text-primary italic">Nook</span>
                  </span>
                </SheetTitle>
              </SheetHeader>

              <nav
                aria-label="Mobile navigation"
                className="flex flex-col gap-1 px-4 py-2"
              >
                {links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "rounded-md px-3 py-2.5 text-base transition-colors hover:bg-muted hover:text-primary",
                      isActivePath(pathname, link.href) &&
                        "bg-muted font-medium text-primary",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto flex flex-col gap-2 border-t border-border p-4">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2.5 text-base font-medium transition-colors hover:bg-muted"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md bg-primary px-3 py-2.5 text-center text-base font-medium text-primary-foreground transition-colors hover:bg-primary/85"
                >
                  Register
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
