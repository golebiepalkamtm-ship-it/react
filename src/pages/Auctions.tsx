import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuctionsPage from "@/components/AuctionsPage";

const Auctions = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <AuctionsPage />
      </main>
      <Footer />
    </div>
  );
};

export default Auctions;
