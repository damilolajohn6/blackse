import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Header from "@/components/Layout/Header";

export default function Home() {
  return (
    <div>
      <Header />
      <main className="">
       <Hero />
      </main>
      <Footer />
    </div>
  );
}