"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  ChevronDown,
  LogOut,
  Menu,
  UserRound,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ThemeToggle from "@/components/theme-toggle";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "cn";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const links = [
  { label: "Home", href: "/" },
  { label: "All Books", href: "/all-books" },
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

function UserAvatar({
  image,
  name,
  size = "default",
}: {
  image?: string | null;
  name: string;
  size?: "default" | "sm" | "lg";
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Avatar size={size}>
      {image ? <AvatarImage src={image} alt={`${name}'s profile`} /> : null}
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}

function AccountMenu({
  user,
  onNavigate,
}: {
  user: { name: string; email: string; image?: string | null };
  onNavigate?: () => void;
}) {
  const router = useRouter();

  async function handleSignOut() {
    const { error } = await authClient.signOut();

    if (error) {
      toast.error(error.message || "Unable to log out. Please try again.");
      return;
    }

    onNavigate?.();
    router.refresh();
    toast.success("Logged out successfully.");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open account menu"
        className="group flex items-center gap-3 rounded-md outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
      >
        <UserAvatar image={user.image} name={user.name} size="lg" />
        <span className="max-w-36 truncate text-[15px] font-medium text-foreground">
          {user.name}
        </span>
        <ChevronDown
          className="size-5 text-muted-foreground transition-transform group-data-popup-open:rotate-180"
          aria-hidden="true"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-72 overflow-hidden rounded-none border border-border bg-background p-0 shadow-md"
      >
        <div className="flex items-center gap-4 border-b border-border px-6 py-5">
          <UserAvatar image={user.image} name={user.name} size="lg" />
          <div className="min-w-0">
            <p className="truncate font-heading text-xl text-foreground">
              {user.name}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
        <div className="p-2">
          <DropdownMenuItem
            className="h-12 gap-4 rounded-none px-4 text-base"
            onClick={() => {
              onNavigate?.();
              router.push("/profile");
            }}
          >
            <UserRound className="size-5" aria-hidden="true" />
            My Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            className="h-12 gap-4 rounded-none px-4 text-base"
            onClick={handleSignOut}
          >
            <LogOut className="size-5" aria-hidden="true" />
            Logout
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

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
          {!isPending && user ? (
            <AccountMenu user={user} />
          ) : !isPending ? (
            <>
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
            </>
          ) : null}
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
                {!isPending && user ? (
                  <AccountMenu
                    user={user}
                    onNavigate={() => setMobileOpen(false)}
                  />
                ) : !isPending ? (
                  <>
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
                  </>
                ) : null}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
