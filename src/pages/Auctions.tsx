import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuctionsPage from "@/components/AuctionsPage";

const Auctions = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <Header />
      <main className="relative z-10">
        <AuctionsPage />
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default Auctions;
