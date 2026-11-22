"use client";

import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, ImagePlus, LockKeyhole } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";

const categories = ["Fiction", "Science", "History", "Kids", "Others"];

type FormErrors = Partial<
  Record<"title" | "author" | "category" | "image" | "description" | "copies", string>
>;

export default function AddBookPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [copies, setCopies] = useState("1");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = "BookNook | Add Book";
  }, []);

  function selectImage(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrors((current) => ({
        ...current,
        image: "Choose a JPG, PNG, or WebP image.",
      }));
      return;
    }
    if (file.size > 32 * 1024 * 1024) {
      setErrors((current) => ({
        ...current,
        image: "The image must be smaller than 32 MB.",
      }));
      return;
    }
    setErrors((current) => ({ ...current, image: undefined }));
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));
    setImageFile(file);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    selectImage(event.target.files?.[0]);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    selectImage(event.dataTransfer.files?.[0]);
  }

  async function uploadImage(file: File) {
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    if (!apiKey) {
      throw new Error("Image upload is not configured.");
    }

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error("The book cover could not be uploaded.");
    }

    const result = (await response.json()) as {
      success?: boolean;
      data?: { url?: string; display_url?: string };
    };

    const imageUrl = result.data?.display_url || result.data?.url;
    if (!result.success || !imageUrl) {
      throw new Error("The image service did not return a valid URL.");
    }
    return imageUrl;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FormErrors = {};
    if (!title.trim()) nextErrors.title = "Enter the book title.";
    if (!author.trim()) nextErrors.author = "Enter the author's name.";
    if (!category) nextErrors.category = "Select a category.";
    if (!imageFile) nextErrors.image = "Add a book cover image.";
    if (!description.trim()) {
      nextErrors.description = "Enter a short description.";
    } else if (description.length > 400) {
      nextErrors.description = "Keep the description within 400 characters.";
    }
    if (!Number.isInteger(Number(copies)) || Number(copies) < 1) {
      nextErrors.copies = "Enter at least 1 copy.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please complete all required book details.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (!imageFile) throw new Error("Add a book cover image.");
      const imageUrl = await uploadImage(imageFile);
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      const addedDate = new Date().toISOString();
      const response = await fetch(`${apiUrl}/books`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: title.trim(),
          author: author.trim(),
          category,
          image: imageUrl,
          description: description.trim(),
          userName: user?.name || "",
          userEmail: user?.email || "",
          totalCopies: Number(copies),
          availableCopies: Number(copies),
          createdAt: addedDate,
          addedDate,
        }),
      });

      if (!response.ok) {
        let message = "The book could not be added.";
        try {
          const result = (await response.json()) as { message?: string };
          if (result.message) message = result.message;
        } catch {
        }
        throw new Error(message);
      }

      toast.success("Book added successfully!");
      setTitle("");
      setAuthor("");
      setCategory("");
      setDescription("");
      setCopies("1");
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview("");
      setImageFile(null);
      setErrors({});
      // router.push("/my-books");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "The book could not be added. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function cancelForm() {
    setTitle("");
    setAuthor("");
    setCategory("");
    setDescription("");
    setCopies("1");
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview("");
    setImageFile(null);
    setErrors({});
  }

  return (
    <main className="min-h-[720px] bg-background">
      <div className="mx-auto w-full max-w-[1440px] px-6 py-12 lg:px-14 lg:py-16">
        <header className="mb-10">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-10 bg-gold" />
            <p className="text-[10px] font-semibold tracking-[0.28em] text-gold uppercase">
              Share your shelf
            </p>
          </div>
          <h1 className="font-heading text-4xl leading-none font-medium tracking-tight text-foreground sm:text-5xl">
            Add a <span className="italic text-primary">Book</span>
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-6 text-muted-foreground">
            Lend a title from your own collection. Once added, it appears in
            the library for every member to discover and borrow.
          </p>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="space-y-6">
              <section className="border border-border bg-card px-5 py-6 sm:px-8 sm:py-7">
                <h2 className="font-heading text-2xl font-medium text-foreground">
                  Book details
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tell readers what they&apos;ll find between the covers.
                </p>

                <div className="mt-7 space-y-5">
                  <div>
                    <label
                      htmlFor="book-title"
                      className="mb-2 block text-xs font-semibold text-foreground"
                    >
                      Book title
                    </label>
                    <input
                      id="book-title"
                      value={title}
                      onChange={(event) => {
                        setTitle(event.target.value);
                        setErrors((current) => ({
                          ...current,
                          title: undefined,
                        }));
                      }}
                      placeholder="e.g. The Remains of the Day"
                      className={`h-12 w-full rounded-[3px] border bg-background px-4 text-sm outline-none placeholder:text-muted-foreground/65 focus:ring-2 focus:ring-ring/20 ${
                        errors.title
                          ? "border-destructive"
                          : "border-border focus:border-ring"
                      }`}
                    />
                    {errors.title ? (
                      <p className="mt-1.5 text-xs text-destructive">
                        {errors.title}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="book-author"
                        className="mb-2 block text-xs font-semibold text-foreground"
                      >
                        Author name
                      </label>
                      <input
                        id="book-author"
                        value={author}
                        onChange={(event) => {
                          setAuthor(event.target.value);
                          setErrors((current) => ({
                            ...current,
                            author: undefined,
                          }));
                        }}
                        placeholder="e.g. Kazuo Ishiguro"
                        className={`h-12 w-full rounded-[3px] border bg-background px-4 text-sm outline-none placeholder:text-muted-foreground/65 focus:ring-2 focus:ring-ring/20 ${
                          errors.author
                            ? "border-destructive"
                            : "border-border focus:border-ring"
                        }`}
                      />
                      {errors.author ? (
                        <p className="mt-1.5 text-xs text-destructive">
                          {errors.author}
                        </p>
                      ) : null}
                    </div>
                    <div>
                      <label
                        htmlFor="book-category"
                        className="mb-2 block text-xs font-semibold text-foreground"
                      >
                        Category
                      </label>
                      <select
                        id="book-category"
                        value={category}
                        onChange={(event) => {
                          setCategory(event.target.value);
                          setErrors((current) => ({
                            ...current,
                            category: undefined,
                          }));
                        }}
                        className={`h-12 w-full appearance-none rounded-[3px] bg-background px-4 text-sm outline-none ${
                          errors.category
                            ? "border border-destructive"
                            : "border border-border"
                        }`}
                      >
                        <option value="" disabled>
                          Select a category
                        </option>
                        {categories.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                      {errors.category ? (
                        <p className="mt-1.5 text-xs text-destructive">
                          {errors.category}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-foreground">
                      Book cover image <span className="font-normal text-muted-foreground">(required)</span>
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => fileInputRef.current?.click()}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          fileInputRef.current?.click();
                        }
                      }}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={handleDrop}
                      className={`flex h-36 cursor-pointer flex-col items-center justify-center border border-dashed px-4 text-center transition-colors ${
                        errors.image
                          ? "border-destructive"
                          : "border-border hover:border-primary/50 hover:bg-muted/30"
                      }`}
                    >
                      <span className="flex size-9 items-center justify-center rounded-full bg-muted text-primary">
                        <ImagePlus className="size-4" aria-hidden="true" />
                      </span>
                      <p className="mt-3 text-xs font-medium text-foreground">
                        Drag an image here, or <span className="text-primary">browse</span>
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        JPG, PNG or WebP up to 32 MB
                      </p>
                    </div>
                    {imageFile ? (
                      <p className="mt-2 truncate text-xs text-muted-foreground">
                        Selected: {imageFile.name}
                      </p>
                    ) : null}
                    {errors.image ? (
                      <p className="mt-1.5 text-xs text-destructive">
                        {errors.image}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label
                        htmlFor="book-description"
                        className="text-xs font-semibold text-foreground"
                      >
                        Short description
                      </label>
                      <span className="text-[10px] text-muted-foreground">
                        {description.length}/400
                      </span>
                    </div>
                    <textarea
                      id="book-description"
                      value={description}
                      maxLength={400}
                      onChange={(event) => {
                        setDescription(event.target.value);
                        setErrors((current) => ({
                          ...current,
                          description: undefined,
                        }));
                      }}
                      placeholder="What makes this book worth borrowing? A sentence or two for fellow readers."
                      className={`min-h-28 w-full resize-none rounded-[3px] border bg-background px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/65 focus:ring-2 focus:ring-ring/20 ${
                        errors.description
                          ? "border-destructive"
                          : "border-border focus:border-ring"
                      }`}
                    />
                    {errors.description ? (
                      <p className="mt-1.5 text-xs text-destructive">
                        {errors.description}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label
                      htmlFor="book-copies"
                      className="mb-2 block text-xs font-semibold text-foreground"
                    >
                      Total copies
                    </label>
                    <input
                      id="book-copies"
                      type="number"
                      min={1}
                      value={copies}
                      onChange={(event) => {
                        setCopies(event.target.value);
                        setErrors((current) => ({
                          ...current,
                          copies: undefined,
                        }));
                      }}
                      className={`h-12 w-full max-w-72 rounded-[3px] border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring/20 ${
                        errors.copies
                          ? "border-destructive"
                          : "border-border focus:border-ring"
                      }`}
                    />
                    {errors.copies ? (
                      <p className="mt-1.5 text-xs text-destructive">
                        {errors.copies}
                      </p>
                    ) : null}
                  </div>
                </div>
              </section>

              <section className="border border-border bg-card px-5 py-6 sm:px-8 sm:py-7">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-heading text-2xl font-medium text-foreground">
                      Shared by
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Shown on the book page so borrowers know who to thank.
                    </p>
                  </div>
                  <LockKeyhole
                    className="size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="shared-name"
                      className="mb-2 block text-xs font-semibold text-foreground"
                    >
                      Your name
                    </label>
                    <input
                      id="shared-name"
                      value={user?.name || ""}
                      readOnly
                      placeholder="Loading..."
                      className="h-12 w-full rounded-[3px] border border-border bg-muted/40 px-4 text-sm text-muted-foreground outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="shared-email"
                      className="mb-2 block text-xs font-semibold text-foreground"
                    >
                      Your email
                    </label>
                    <input
                      id="shared-email"
                      value={user?.email || ""}
                      readOnly
                      placeholder="Loading..."
                      className="h-12 w-full rounded-[3px] border border-border bg-muted/40 px-4 text-sm text-muted-foreground outline-none"
                    />
                  </div>
                </div>
              </section>
            </div>

            <aside className="lg:sticky lg:top-24">
              <p className="mb-4 text-[9px] font-semibold tracking-[0.25em] text-gold uppercase">
                Live cover preview
              </p>
              <div className="border border-border bg-card p-6">
                <div className="relative mx-auto flex aspect-[4/5] w-[190px] items-center justify-center overflow-hidden bg-[#5b2a31] shadow-lg">
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt={title || "Book cover preview"}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-x-5 top-6 bottom-6 border border-gold/45">
                      <div className="absolute inset-x-3 top-3 bottom-3 border border-gold/20" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-primary-foreground">
                        <span className="mb-5 h-px w-5 bg-gold" />
                        <p className="font-heading text-xl leading-tight">
                          {title.trim() || "Your Book Title"}
                        </p>
                        <p className="mt-3 text-[8px] font-medium tracking-[0.18em] uppercase text-gold">
                          {author.trim() || "Author name"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <ol className="mt-6 space-y-4 text-xs leading-5 text-muted-foreground">
                <li>
                  <span className="mr-2 text-gold">I.</span>
                  Books appear instantly in All Books and New Arrivals.
                </li>
                <li>
                  <span className="mr-2 text-gold">II.</span>
                  You can edit or remove the title from My Books.
                </li>
                <li>
                  <span className="mr-2 text-gold">III.</span>
                  Each copy can be lent to one reader at a time.
                </li>
              </ol>
            </aside>
          </div>

          <div className="mt-8 flex flex-col-reverse items-stretch justify-end gap-3 border-t border-border pt-5 sm:flex-row sm:items-center">
            <p className="mr-auto hidden text-[10px] text-muted-foreground sm:block">
              Prototype: new books are saved to the online library.
            </p>
            <button
              type="button"
              onClick={cancelForm}
              disabled={isSubmitting}
              className="h-11 min-w-28 rounded-[3px] border border-border px-6 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 min-w-32 items-center justify-center gap-2 rounded-[3px] bg-primary px-6 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/85 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="size-4" />
                  Adding...
                </>
              ) : (
                <>
                  <Check className="size-4" aria-hidden="true" />
                  Add Book
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}