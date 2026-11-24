import Banner from "@/components/Banner";
import HowBorrowingWorks from "@/components/HowBorrowingWorks";
import NewArrivals from "@/components/NewArrivals";
import TopCategories from "@/components/TopCategories";

export default function Home() {
  return (
    <>
      <main className="flex flex-col bg-background">
        {/* Banner suspends its Swiper behind a skeleton — Swiper reads
            `new Date()` while initializing, which cannot be prerendered. */}
        <Banner />
        <NewArrivals />
        <TopCategories />
        <HowBorrowingWorks />
      </main>
    </>
  );
}
