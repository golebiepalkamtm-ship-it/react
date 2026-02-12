import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TimeTunnel from "@/components/achievements/TimeTunnel";

const FlightResults = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <TimeTunnel />
      <Footer />
    </div>
  );
}

export default FlightResults;
