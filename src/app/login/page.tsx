"use client";

import Link from "next/link";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import { useState, type FormEvent } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fillDemoAccount = () => {
    setEmail("eleanor@booknook.co");
    setPassword("Heading1");
    setErrors({});
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(nextErrors);
  };

  return (
    <main className="grid min-h-[720px] grid-cols-1 bg-background lg:grid-cols-2">
      <section className="relative hidden min-h-[720px] overflow-hidden lg:block">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/library-login.jpg')" }}
        />
        <div className="absolute inset-0 bg-[#2a100a]/48" />

        <div className="absolute bottom-14 left-10 z-10 max-w-[520px] text-white xl:left-14">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full border border-white/35">
              <BookOpen className="size-[18px]" strokeWidth={1.5} />
            </span>
            <span className="font-heading text-[26px]">
              Book<span className="italic text-gold">Nook</span>
            </span>
          </Link>

          <blockquote className="mt-8 max-w-[500px] font-heading text-[29px] leading-[1.32] italic xl:text-[32px]">
            “Libraries will get you through times of no money better than money
            will get you through times of no libraries.”
          </blockquote>
          <p className="mt-5 text-[11px] font-medium tracking-[0.22em] text-white/65">
            — ANNE HERBERT
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center bg-background px-5 py-12 sm:px-10 lg:min-h-[720px] lg:px-12 xl:px-20 xl:py-16">
        <div className="w-full max-w-[430px]">
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-10 bg-gold" />
              <p className="text-[12px] font-semibold tracking-[0.28em] text-gold">
                MEMBERS&apos; ENTRANCE
              </p>
            </div>
            <h1 className="font-heading text-[38px] leading-none font-semibold tracking-tight text-foreground">
              Login to <span className="italic text-primary">BookNook</span>
            </h1>
            <p className="mt-3 text-[13px] leading-6 text-muted-foreground">
              Log in to borrow books and manage your shelf.
            </p>
          </div>


          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-[16px] font-semibold text-foreground"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setErrors((current) => ({ ...current, email: "" }));
                }}
                aria-invalid={Boolean(errors.email)}
                placeholder="you@example.com"
                className={`h-[52px] w-full rounded-[3px] border bg-card px-4 text-[13px] outline-none placeholder:text-muted-foreground/65 focus:ring-2 focus:ring-ring/20 ${
                  errors.email
                    ? "border-destructive focus:border-destructive"
                    : "border-border focus:border-ring"
                }`}
              />
              {errors.email && (
                <p className="mt-1.5 text-[10px] text-destructive">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-[16px] font-semibold text-foreground"
                >
                  Password
                </label>
                <Link
                  href="#"
                  className="text-[10px] text-muted-foreground hover:text-primary"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setErrors((current) => ({ ...current, password: "" }));
                  }}
                  aria-invalid={Boolean(errors.password)}
                  placeholder="Your password"
                  className={`h-[52px] w-full rounded-[3px] border bg-card px-4 pr-12 text-[13px] outline-none placeholder:text-muted-foreground/65 focus:ring-2 focus:ring-ring/20 ${
                    errors.password
                      ? "border-destructive focus:border-destructive"
                      : "border-border focus:border-ring"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-[10px] text-destructive">
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="h-[52px] w-full rounded-[3px] bg-primary text-[18px] font-semibold text-primary-foreground transition-colors hover:bg-primary/85"
            >
              Login
            </button>
          </form>

          <div className="my-5 flex items-center gap-4">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[9px] font-medium tracking-[0.22em] text-muted-foreground">
              OR
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            className="flex h-[52px] w-full items-center justify-center rounded-[3px] border border-border bg-card text-[15px] font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <svg
              className="mr-3 size-[17px]"
              viewBox="0 0 18 18"
              aria-hidden="true"
            >
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.64-.06-1.26-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.79 2.71v2.26h2.9c1.7-1.57 2.69-3.88 2.69-6.61z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.81.55-1.84.87-3.06.87-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z"
              />
              <path
                fill="#FBBC05"
                d="M3.95 10.71A5.42 5.42 0 0 1 3.67 9c0-.59.1-1.17.28-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l2.99-2.33z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.32 0 2.5.45 3.43 1.34l2.56-2.56A8.67 8.67 0 0 0 9 0 9 9 0 0 0 .96 4.96l2.99 2.33C4.66 5.16 6.65 3.58 9 3.58z"
              />
            </svg>
            Continue with Google
          </button>

          <p className="mt-6 text-center text-[11px] text-muted-foreground">
            New to BookNook?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
