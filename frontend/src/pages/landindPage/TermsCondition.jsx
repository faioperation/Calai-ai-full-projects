import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone } from "lucide-react";

const TermsCondition = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white font-inter">
      {/* Header */}
      <header className="border-b border-white/10 px-4 md:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
        <div className="flex w-full md:w-auto items-center justify-between md:justify-start gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 shrink-0 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="text-gray-300">Hello!! Welcome to Calai</div>
        </div>

        <div className="flex  sm:flex-row items-center gap-3 sm:gap-6 text-gray-300 w-full md:w-auto justify-end sm:justify-end">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 shrink-0" />
            <span className="text-xs sm:text-sm">Enquiries@calai.info</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 shrink-0" />
            <span className="text-xs sm:text-sm">+447719436543</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className=" mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-6 text-[#E8D1FF]">
          Terms & Condition
        </h1>

        <p className="text-gray-300 leading-relaxed mb-6">
          We value your privacy and are committed to protecting your personal
          and business data.This privacy policy explains how we collect, use,
          and safeguard your information when you use our platform.
        </p>

        <p className="text-gray-300 mb-4">We may collect:</p>
        <ul className="list-disc list-inside text-gray-300 space-y-3 mb-10 ml-4">
          <li>Account information</li>
          <li>Business data provided by users</li>
          <li>Messages and conversations processed by the AI system</li>
          <li>Usage and analytics data</li>
        </ul>

        <h2 className="text-3xl font-bold mb-6 text-[#E8D1FF]">Definitions</h2>
        <p className="text-gray-300 leading-relaxed mb-6">
          We strive to ensure high uptime but do not guarantee uninterrupted
          service. Limitation of Liability.
        </p>

        <p className="text-gray-300 mb-4">We are not liable for:</p>
        <ul className="list-disc list-inside text-gray-300 space-y-3 mb-10 ml-4">
          <li>Business Losses</li>
          <li>Data loss due to third-party services</li>
          <li>Misuse of the platform</li>
        </ul>
      </main>
    </div>
  );
};

export default TermsCondition;
