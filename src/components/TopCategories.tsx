import Image from "next/image";
import Link from "next/link";

const categories = [
  {
    name: "Fiction",
    slug: "fiction",
    count: "05",
    description: "Novels, classics and modern voices",
    image:
      "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=800&q=85",
    imageAlt: "An open book and a warm cup of tea",
  },
  {
    name: "Science",
    slug: "science",
    count: "04",
    description: "The cosmos, the cell and everything between",
    image:
      "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=85",
    imageAlt: "A colorful nebula in deep space",
  },
  {
    name: "History",
    slug: "history",
    count: "03",
    description: "Empires, revolutions and ordinary lives",
    image:
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=85",
    imageAlt: "A stack of old books on a wooden table",
  },
  {
    name: "Kids",
    slug: "kids",
    count: "03",
    description: "Picture books and first chapters",
    image:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=800&q=85",
    imageAlt: "A child reading a book",
  },
  {
    name: "Others",
    slug: "others",
    count: "03",
    description: "Essays, craft, cookery and more",
    image:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=800&q=85",
    imageAlt: "Books arranged on a shelf",
  },
];

export default function TopCategories() {
  return (
    <section aria-labelledby="top-categories-title" className="bg-background mt-[-50px]">
      <div className="mx-auto w-full max-w-[1440px] px-6 py-16 lg:px-14 lg:py-24">
        <div className="mb-10">
          <div className="flex items-center gap-3">
            <span className="h-px w-9 bg-gold" aria-hidden="true" />
            <p className="text-[10px] font-semibold tracking-[0.3em] text-gold uppercase">
              Find your shelf
            </p>
          </div>
          <h2
            id="top-categories-title"
            className="font-heading mt-5 text-4xl font-medium tracking-tight text-foreground sm:text-5xl"
          >
            Top Categories
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-6">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/books?category=${category.slug}`}
              className="group min-w-0"
              aria-label={`Browse ${category.name} books`}
            >
              <div className="relative aspect-[0.75] overflow-hidden bg-muted">
                <Image
                  src={category.image}
                  alt={category.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="pt-3">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-heading text-xl font-medium text-foreground transition-colors group-hover:text-primary sm:text-2xl">
                    {category.name}
                  </h3>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {category.count} titles
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
