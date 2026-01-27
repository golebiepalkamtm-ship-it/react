import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TimeTunnel from "@/chronoTunnel/TimeTunnel";

const Achievements = () => {
  return (
    <div className="min-h-screen bg-background achievements-tunnel">
      <Header />
      <main className="relative pt-0">
        <TimeTunnel />
      </main>
      <Footer />
    </div>
  );
};

export default Achievements;
