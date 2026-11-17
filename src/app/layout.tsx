import type { Metadata } from "next";
import { Fraunces, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "BookNook — Find your next unforgettable read",
    template: "BookNook | %s",
  },
  description:
    "Explore stories, ideas, and discoveries across our growing collection.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${fraunces.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var t=localStorage.getItem("booknook-theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}',
          }}
        />
        <Navbar></Navbar>
        {children}
        <Footer></Footer>
      </body>
    </html>
  );
}
