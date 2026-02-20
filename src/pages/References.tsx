import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ReferencesPage } from "@/components/references/ReferencesPage";

const References = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-transparent">
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
