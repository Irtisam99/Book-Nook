import Navbar from "@/components/Navbar";
import Banner from "@/components/Banner";
import HowBorrowingWorks from "@/components/HowBorrowingWorks";

export default function Home() {
  return (
    <>
      <Navbar />
      {/* Banner suspends its Swiper behind a skeleton — Swiper reads
          `new Date()` while initializing, which cannot be prerendered. */}
      <Banner />
      <HowBorrowingWorks />
    </>
  );
}
