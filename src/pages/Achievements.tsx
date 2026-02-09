import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TimelineSection from "@/components/TimelineSection";

const Achievements = () => {
  return (
    <div className="min-h-screen bg-background achievements-tunnel">
      <Header />
      <main className="relative pt-0">
        <TimelineSection />
      </main>
      <Footer />
    </div>
  );
};

export default Achievements;
