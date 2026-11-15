export type HeroSlide = {
  id: string;
  eyebrow: string;
  headlineStart: string;
  headlineAccent: string;
  headlineEnd: string;
  description: string;
  image: { src: string; alt: string };
  overlayImage: { src: string; alt: string };
  book: { title: string; author: string };
};

export const heroSlides: HeroSlide[] = [
  {
    id: "new-arrivals",
    eyebrow: "New on the shelves",
    headlineStart: "Find your next",
    headlineAccent: "unforgettable",
    headlineEnd: "read.",
    description:
      "Fresh arrivals every week, hand-picked across every genre — there is always something new waiting on the shelves.",
    image: {
      src: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80",
      alt: "Wooden shelves lined with well-loved hardcover books",
    },
    overlayImage: {
      src: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80",
      alt: "A cup of coffee beside an open book on a table",
    },
    book: { title: "The Midnight Library", author: "Matt Haig" },
  },
  {
    id: "editors-pick",
    eyebrow: "Editor's pick",
    headlineStart: "Stories that",
    headlineAccent: "stay",
    headlineEnd: "with you.",
    description:
      "This month's favourite: a quiet, luminous novel you will be pressing into friends' hands for years to come.",
    image: {
      src: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80",
      alt: "A tall library aisle packed with colourful books",
    },
    overlayImage: {
      src: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
      alt: "A neat stack of books on a wooden surface",
    },
    book: { title: "Klara and the Sun", author: "Kazuo Ishiguro" },
  },
  {
    id: "science-history",
    eyebrow: "Science & history",
    headlineStart: "For the endlessly",
    headlineAccent: "curious",
    headlineEnd: "minds.",
    description:
      "From the birth of the universe to the story of everything — big ideas written for curious readers of any age.",
    image: {
      src: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80",
      alt: "A sunlit library hall with rows of tall shelving",
    },
    overlayImage: {
      src: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80",
      alt: "An open book resting on a wooden table",
    },
    book: { title: "A Short History of Nearly Everything", author: "Bill Bryson" },
  },
  {
    id: "kids-family",
    eyebrow: "Kids & family",
    headlineStart: "Big adventures for",
    headlineAccent: "little",
    headlineEnd: "readers.",
    description:
      "Picture books, early readers and bedtime favourites — storytime starts here for the youngest members of the nook.",
    image: {
      src: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1200&q=80",
      alt: "Colourful books arranged closely on a shelf",
    },
    overlayImage: {
      src: "https://images.unsplash.com/photo-1491841573634-28140fc7ced7?auto=format&fit=crop&w=600&q=80",
      alt: "The open pages of a book caught in soft light",
    },
    book: { title: "Where the Wild Things Are", author: "Maurice Sendak" },
  },
  {
    id: "timeless-classics",
    eyebrow: "Timeless classics",
    headlineStart: "Old favorites,",
    headlineAccent: "new",
    headlineEnd: "friends.",
    description:
      "The stories that shaped generations — beautifully bound and ready to be discovered all over again.",
    image: {
      src: "https://images.unsplash.com/photo-1526243741027-444d633d7365?auto=format&fit=crop&w=1200&q=80",
      alt: "A shelf of well-worn classic books",
    },
    overlayImage: {
      src: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80",
      alt: "A small pile of vintage books",
    },
    book: { title: "Pride and Prejudice", author: "Jane Austen" },
  },
];
