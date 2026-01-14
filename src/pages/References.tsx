import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ReferencesPage } from "@/components/references/ReferencesPage";

const References = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 bg-hero-gradient grid-overlay -z-10 pointer-events-none" />
      <Header />
      <main className="relative z-10">
        <ReferencesPage />
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default References;
