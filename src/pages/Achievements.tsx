import Header from "@/components/Header";
import AchievementsSection from "@/components/AchievementsSection";
import Footer from "@/components/Footer";

const Achievements = () => {
  return (
    <div className="min-h-screen bg-navy">
      <Header />
      <main>
        <AchievementsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Achievements;
