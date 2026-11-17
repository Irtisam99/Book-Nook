import Link from "next/link";
import { BookOpen, CalendarCheck2, Compass, RotateCcw } from "lucide-react";

const steps = [
  {
    numeral: "I",
    icon: Compass,
    title: "Discover",
    description:
      "Wander the collection by category or search for a title you've been meaning to read.",
  },
  {
    numeral: "II",
    icon: CalendarCheck2,
    title: "Borrow",
    description:
      "Reserve an available copy in one click and choose a return date that suits your pace.",
  },
  {
    numeral: "III",
    icon: BookOpen,
    title: "Read",
    description:
      "Take up to 30 days. Slow reading is encouraged — there's no rush here.",
  },
  {
    numeral: "IV",
    icon: RotateCcw,
    title: "Return",
    description:
      "Mark it returned from My Borrows so the next reader can enjoy it too.",
  },
];

export default function HowBorrowingWorks() {
  return (
    <section className="bg-white dark:bg-card">
      <div className="mx-auto w-full max-w-[1280px] px-6 py-16 lg:py-24">
        {/* Heading */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-4">
            <span className="h-px w-10 bg-gold" aria-hidden="true" />
            <p className="text-xs font-semibold tracking-[0.3em] text-gold uppercase">
              Simple as a library card
            </p>
          </div>
          <h2 className="font-heading mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            How Borrowing Works
          </h2>
        </div>

        {/* Steps */}
        <div className="mt-14 grid gap-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-border">
          {steps.map((step) => (
            <div
              key={step.numeral}
              className="flex flex-col items-center px-6 text-center lg:py-2"
            >
              <p className="font-heading text-lg text-gold italic">
                {step.numeral}
              </p>
              <div className="mt-6 flex size-20 items-center justify-center rounded-full border border-border bg-muted">
                <step.icon
                  className="size-7 text-primary"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </div>
              <h3 className="font-heading mt-7 text-[1.7rem] font-semibold tracking-tight text-foreground">
                {step.title}
              </h3>
              <p className="mt-3 max-w-[17rem] leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 flex justify-center">
          <Link
            href="/register"
            className="inline-flex h-12 items-center rounded-md border border-border bg-card px-8 text-[15px] font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            Get your free membership
          </Link>
        </div>
      </div>
    </section>
  );
}
