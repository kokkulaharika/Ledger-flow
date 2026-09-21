import React from "react";

import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import Solutions from "../components/landing/Solutions";
import HowItWorks from "../components/landing/HowItWorks";
import About from "../components/landing/About";

function LandingPage() {
  return (
    <>
      <Navbar />

      <main>

        <div id="home">
          <Hero />
        </div>

        <Features />

        <Solutions />

        <HowItWorks />

        <About />

      </main>
    </>
  );
}

export default LandingPage;