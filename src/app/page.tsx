import Navbar from "@/components/Navbar";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import HowBorrowingWorks from "@/components/HowBorrowingWorks";
import TopCategories from "@/components/TopCategories";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col bg-background">
        {/* Banner suspends its Swiper behind a skeleton — Swiper reads
            `new Date()` while initializing, which cannot be prerendered. */}
        <Banner />
        <TopCategories />
        <HowBorrowingWorks />
        <Footer />
      </main>
    </>
  );
}
