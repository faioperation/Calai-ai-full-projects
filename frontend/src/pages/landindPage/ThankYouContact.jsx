import React from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const ThankYouContact = () => {
  return (
    <div className="bg-[#000000] min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-[#59168B]/20 to-[#1C398E]/20 border border-[#59168B]/30 p-10 rounded-3xl max-w-2xl w-full text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="w-20 h-20 bg-[#59168B]/30 text-[#00D3F3] border border-[#C27AFF]/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(0,211,243,0.2)]">
            <svg
              className="w-10 h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-[#C27AFF] to-[#00D3F3] bg-clip-text text-transparent">
            Thank You!
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Thank you for your interest, our team will be in touch shortly.
          </p>
          <Link
            to="/"
            className="inline-block bg-linear-to-t from-[#00135B] via-[#02060F] to-[#00104E] hover:from-[#001c80] hover:to-[#001870] border border-[#0F42FF] text-white font-medium py-3 px-8 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(15,66,255,0.4)] hover:shadow-[0_0_20px_rgba(15,66,255,0.6)]"
          >
            Back to Home
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ThankYouContact;
