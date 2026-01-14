import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuctionsPage from "@/components/AuctionsPage";

const Auctions = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <AuctionsPage />
      </main>
      <Footer />
    </div>
  );
};

export default Auctions;
