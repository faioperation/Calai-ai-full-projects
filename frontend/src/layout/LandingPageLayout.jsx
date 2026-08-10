import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Banner from "@/pages/landindPage/Banner";
import CustomerCalls from "@/pages/landindPage/CustomerCalls";
import FAQ from "@/pages/landindPage/FAQ";
import Features from "@/pages/landindPage/Features";
import HowItWorks from "@/pages/landindPage/HowItWorks";
import Demo from "@/pages/landindPage/Demo";
import Pricing from "@/pages/landindPage/Pricing";
import Stats from "@/pages/landindPage/Stats";
import Contact from "@/pages/landindPage/Contact";
import React from "react";


const LandingPageLayout = () => {
  return (
    <div className="bg-[#000000]">
      <Navbar />
      <Banner />
      <Stats />
      <HowItWorks />
      {/* <Demo /> */}
      <Features />
      <Pricing />
      <FAQ />
      <Contact />
      <CustomerCalls />
      <Footer />
    </div>
  );
};

export default LandingPageLayout;
