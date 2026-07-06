import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

const AuctionCancel = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <Header />
      <main className="relative z-10 container mx-auto px-4 py-16 text-center">
        <XCircle className="w-16 h-16 text-amber-500 mx-auto mb-6" />
        <h1 className="text-3xl font-display font-bold text-foreground mb-4">
          Płatność anulowana
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          Nie dokończono płatności Stripe. Możesz spróbować ponownie z panelu
          konta lub strony aukcji.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link to="/auctions">Wróć do aukcji</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">Strona główna</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AuctionCancel;
