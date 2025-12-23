import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ReferencesPage } from "@/components/references/ReferencesPage";

const References = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <ReferencesPage />
      </main>
      <Footer />
    </div>
  );
};

export default References;
