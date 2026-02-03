import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuctionsPage from "@/components/AuctionsPage";

const Auctions = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-navy via-navy-dark to-navy grid-overlay -z-10 pointer-events-none" />
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/8 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-gold/6 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-gold/7 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/4 rounded-full blur-3xl" />
      </div>
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
