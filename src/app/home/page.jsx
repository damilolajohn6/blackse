import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Header from "@/components/Layout/Header";

export default function Homepage() {
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