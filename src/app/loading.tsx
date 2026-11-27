import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <main
      className="flex min-h-[720px] items-center justify-center bg-background"
      aria-busy="true"
    >
      <Spinner className="size-8" />
    </main>
  );
}
