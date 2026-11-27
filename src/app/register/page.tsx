"use client";

import Link from "next/link";
import { ArrowUpRight, BookOpen, Eye, EyeOff, Check } from "lucide-react";
import { Suspense, useEffect, useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

function safeRedirectDestination(value: string | null) {
    if (!value || !value.startsWith("/") || value.startsWith("//")) {
        return "/";
    }
    return value;
}

function RegisterPageContent() {
    useEffect(() => {
        document.title = "BookNook | Register";
    }, []);

    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [photoUrl, setPhotoUrl] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const searchParams = useSearchParams();
    const redirectTo = safeRedirectDestination(searchParams.get("redirectTo"));
    const passwordRules = [
        { met: /[A-Z]/.test(password), label: "One uppercase letter" },
        { met: /[a-z]/.test(password), label: "One lowercase letter" },
        { met: password.length >= 6, label: "At least 6 characters" },
    ];

    const openPhotoUrl = () => {
        const value = photoUrl.trim();
        if (!value) {
            setErrors((current) => ({ ...current, photo: "Enter a photo URL first." }));
            return;
        }

        try {
            const url = new URL(value);
            if (url.protocol !== "http:" && url.protocol !== "https:") {
                throw new Error("Invalid protocol");
            }
            setErrors((current) => ({ ...current, photo: "" }));
            window.open(url.toString(), "_blank", "noopener,noreferrer");
        } catch {
            setErrors((current) => ({
                ...current,
                photo: "Enter a valid HTTP or HTTPS image URL.",
            }));
        }
    };
    const [isSubmitting, setIsSubmitting] = useState(false);


    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSubmitting) return;

        const form = new FormData(event.currentTarget);
        const formElement = event.currentTarget;

        const name = String(form.get("name") ?? "").trim();
        const email = String(form.get("email") ?? "").trim();
        const photo = String(form.get("photo") ?? "").trim();
        const nextErrors: Record<string, string> = {};

        if (name.length < 2) {
            nextErrors.name = "Enter at least 2 characters.";
        } else if (/\d/.test(name)) {
            nextErrors.name = "Name cannot contain numbers.";
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            nextErrors.email = "Enter a valid email address.";
        }
        if (!/[A-Z]/.test(password)) {
            nextErrors.password = "Add at least one uppercase letter.";
        } else if (!/[a-z]/.test(password)) {
            nextErrors.password = "Add at least one lowercase letter.";
        } else if (password.length < 6) {
            nextErrors.password = "Use at least 6 characters.";
        }
        if (photo) {
            try {
                const url = new URL(photo);
                if (url.protocol !== "http:" && url.protocol !== "https:") {
                    throw new Error("Invalid protocol");
                }
            } catch {
                nextErrors.photo = "Enter a valid HTTP or HTTPS image URL.";
            }
        }

        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            return;
        }

        const user = Object.fromEntries(form.entries());
        const fallbackImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name as string)}&background=5b2a31&color=ffffff&bold=true&length=1`;

        setIsSubmitting(true);
        try {
            const { data, error } = await authClient.signUp.email({
                name: user.name as string,
                email: user.email as string,
                password: password,
                image: user.photo as string || fallbackImage,
                callbackURL: redirectTo,
            })

            if (error) {
                toast.error(error.message);
                return;
            }
            if (data) {
                toast.success("Registration successful!");
                formElement.reset();
                setPassword("");
                setPhotoUrl("");
                setErrors({});

                window.location.replace(`${window.location.origin}${redirectTo}`);
            }
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Registration failed. Please try again."
            );
        }
        finally {
            setIsSubmitting(false);
        }



    };

    const handleGoogleSignUp = async () => {
        try{
            await authClient.signIn.social({
                provider: "google",
                callbackURL: `${window.location.origin}${redirectTo}`,
            })
        }catch(error){
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Registration failed. Please try again."
            );
        }
    }

    return (
        <main className="grid min-h-[720px] grid-cols-1 bg-background lg:grid-cols-2">
            <section className="relative hidden min-h-[720px] overflow-hidden lg:block">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('/library-register.jpg')" }}
                />
                <div className="absolute inset-0 bg-[#2a100a]/45" />

                <div className="absolute bottom-60 left-10 z-10 text-white xl:left-14">
                    <Link href="/" className="inline-flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-full border border-white/35">
                            <BookOpen className="size-[18px]" strokeWidth={1.5} />
                        </span>
                        <span className="font-heading text-[50px]">
                            Book<span className="italic text-gold">Nook</span>
                        </span>
                    </Link>

                    <blockquote className="mt-8 max-w-[600px] font-heading text-[45px] leading-[1.35] italic xl:text-[35px]">
                        “Once you learn to read, you will be forever free.”
                    </blockquote>
                    <p className="mt-5 text-[18px] font-medium tracking-[0.22em] text-white/65">
                        — FREDERICK DOUGLASS
                    </p>
                </div>
            </section>

            <section className="flex items-center justify-center bg-background px-5 py-12 sm:px-10 lg:min-h-[720px] lg:px-12 xl:px-20 xl:py-16">
                <div className="w-full max-w-[430px]">
                    <div className="mb-7">
                        <div className="mb-3 flex items-center gap-3">
                            <span className="h-px w-10 bg-gold" />
                            <p className="text-[9px] font-semibold tracking-[0.28em] text-gold">
                                FREE MEMBERSHIP
                            </p>
                        </div>
                        <h1 className="font-heading text-[38px] leading-none font-semibold tracking-tight text-foreground">
                            Join the <span className="italic text-primary">Nook</span>
                        </h1>
                        <p className="mt-3 max-w-[320px] text-[13px] leading-6 text-muted-foreground">
                            Create your account to borrow books and share titles from
                            your own shelf.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleSignUp}
                        className="flex h-[52px] w-full items-center justify-center rounded-[3px] border border-border bg-card text-[16px] font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                        <svg className="mr-3 size-[17px]" viewBox="0 0 18 18" aria-hidden="true">
                            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.26-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.79 2.71v2.26h2.9c1.7-1.57 2.69-3.88 2.69-6.61z" />
                            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.81.55-1.84.87-3.06.87-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z" />
                            <path fill="#FBBC05" d="M3.95 10.71A5.42 5.42 0 0 1 3.67 9c0-.59.1-1.17.28-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l2.99-2.33z" />
                            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.43 1.34l2.56-2.56A8.67 8.67 0 0 0 9 0 9 9 0 0 0 .96 4.96l2.99 2.33C4.66 5.16 6.65 3.58 9 3.58z" />
                        </svg>
                        Continue with Google
                    </button>

                    <div className="my-5 flex items-center gap-4">
                        <span className="h-px flex-1 bg-border" />
                        <span className="text-[9px] font-medium tracking-[0.22em] text-muted-foreground">OR</span>
                        <span className="h-px flex-1 bg-border" />
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                        <div>
                            <label htmlFor="full-name" className="mb-2 block text-[14px] font-semibold text-foreground">
                                Full name
                            </label>
                            <input
                                id="full-name"
                                name="name"
                                type="text"
                                required
                                minLength={2}
                                maxLength={80}
                                onChange={() => setErrors((current) => ({ ...current, name: "" }))}
                                aria-invalid={Boolean(errors.name)}
                                placeholder="Eleanor Vance"
                                className={`h-[52px] w-full rounded-[3px] border bg-card px-4 text-[13px] outline-none placeholder:text-muted-foreground/65 focus:ring-2 focus:ring-ring/20 ${errors.name ? "border-destructive focus:border-destructive" : "border-border focus:border-ring"}`}
                            />
                            {errors.name && (
                                <p className="mt-1.5 text-[10px] text-destructive">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="email" className="mb-2 block text-[14px] font-semibold text-foreground">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                maxLength={254}
                                onChange={() => setErrors((current) => ({ ...current, email: "" }))}
                                aria-invalid={Boolean(errors.email)}
                                placeholder="you@example.com"
                                className={`h-[52px] w-full rounded-[3px] border bg-card px-4 text-[13px] outline-none placeholder:text-muted-foreground/65 focus:ring-2 focus:ring-ring/20 ${errors.email ? "border-destructive focus:border-destructive" : "border-border focus:border-ring"}`}
                            />
                            {errors.email && (
                                <p className="mt-1.5 text-[10px] text-destructive">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="photo" className="mb-2 block text-[14px] font-semibold text-foreground">
                                Photo URL <span className="font-normal text-muted-foreground">(optional)</span>
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    id="photo"
                                    name="photo"
                                    type="url"
                                    value={photoUrl}
                                    onChange={(event) => {
                                        setPhotoUrl(event.target.value);
                                        setErrors((current) => ({ ...current, photo: "" }));
                                    }}
                                    maxLength={2048}
                                    aria-invalid={Boolean(errors.photo)}
                                    placeholder="https://.../portrait.jpg"
                                    className={`h-[52px] min-w-0 flex-1 rounded-[3px] border bg-card px-4 text-[13px] outline-none placeholder:text-muted-foreground/65 focus:ring-2 focus:ring-ring/20 ${errors.photo ? "border-destructive focus:border-destructive" : "border-border focus:border-ring"}`}
                                />
                                <button
                                    type="button"
                                    onClick={openPhotoUrl}
                                    aria-label="Open photo URL"
                                    className="flex size-[52px] shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <ArrowUpRight className="size-5" />
                                </button>
                            </div>
                            {errors.photo ? (
                                <p className="mt-1.5 text-[10px] text-destructive">{errors.photo}</p>
                            ) : (
                                <p className="mt-2 text-[9px] text-muted-foreground/75">
                                    Shown on your profile and the books you share.
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="mb-2 block text-[14px] font-semibold text-foreground">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    value={password}
                                    onChange={(event) => {
                                        setPassword(event.target.value);
                                        setErrors((current) => ({ ...current, password: "" }));
                                    }}
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength={6}
                                    maxLength={128}
                                    aria-invalid={Boolean(errors.password)}
                                    placeholder="Create a password"
                                    className={`h-[52px] w-full rounded-[3px] border bg-card px-4 pr-12 text-[13px] outline-none placeholder:text-muted-foreground/65 focus:ring-2 focus:ring-ring/20 ${errors.password ? "border-destructive focus:border-destructive" : "border-border focus:border-ring"}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((current) => !current)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                                >
                                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </button>
                            </div>

                            <div className="mt-3 grid grid-cols-3 gap-2">
                                {passwordRules.map((rule) => (
                                    <div
                                        key={rule.label}
                                        className="flex items-start gap-2 text-[9px] leading-4 text-muted-foreground"
                                    >
                                        <span
                                            className={`mt-[2px] flex size-3 shrink-0 items-center justify-center rounded-full border ${rule.met
                                                ? "border-green-500 bg-green-500 text-white"
                                                : "border-border"
                                                }`}
                                        >
                                            {rule.met && <Check className="size-2.5" strokeWidth={3} />}
                                        </span>
                                        <span>{rule.label}</span>
                                    </div>
                                ))}
                            </div>
                            {errors.password && (
                                <p className="mt-2 text-[10px] text-destructive">{errors.password}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-[52px] w-full rounded-[3px] bg-primary text-[20px] font-semibold text-primary-foreground transition-colors hover:bg-primary/85"
                        >
                            {isSubmitting ? "Creating account..." : "Register"}
                        </button>
                    </form>

                    <p className="mt-5 text-center text-[10px] leading-5 text-muted-foreground/80">
                        By registering you agree to{" "}
                        <Link href="#" className="underline underline-offset-2">return books on time</Link>{" "}
                        and <Link href="#" className="underline underline-offset-2">treat them kindly.</Link>
                    </p>
                    <p className="mt-5 text-center text-[14px] text-muted-foreground">
                        Already a member?{" "}
                        <Link href={`/login?redirectTo=${encodeURIComponent(redirectTo)}`} className="font-semibold text-primary hover:underline">
                            Log in
                        </Link>
                    </p>
                </div>
            </section>
        </main>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={null}>
            <RegisterPageContent />
        </Suspense>
    );
}
