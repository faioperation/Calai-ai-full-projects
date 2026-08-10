import React from "react";
import { motion } from "framer-motion";

const BannerGraphic = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: false }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="w-full flex justify-center lg:justify-end relative mt-10 md:mt-0"
    >
      {/* The whole graphic container */}
      <div className="relative w-full max-w-[480px] pt-8 pl-4 pr-12 pb-20 font-inter">
        {/* Top floating processing pill */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-10 z-20 flex items-center gap-3 px-5 py-2.5 bg-[#08131A] border border-[#005260] rounded-xl shadow-lg"
        >
          <div className="flex gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full bg-[#00D3F3] animate-pulse"
              style={{ animationDelay: "0ms" }}
            ></span>
            <span
              className="w-1.5 h-1.5 rounded-full bg-[#00D3F3] animate-pulse"
              style={{ animationDelay: "150ms" }}
            ></span>
            <span
              className="w-1.5 h-1.5 rounded-full bg-[#00D3F3] animate-pulse"
              style={{ animationDelay: "300ms" }}
            ></span>
          </div>
          <span className="text-gray-400 font-mono text-xs tracking-wide">
            AI processing order...
          </span>
        </motion.div>

        {/* Main Card */}
        <div className="relative z-10 w-full bg-[#060B12]/95 backdrop-blur-xl border border-[#003B46] rounded-3xl p-5 md:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* Header (Mac buttons + title) */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-start gap-4">
              <div className="flex gap-1.5 mt-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]"></div>
              </div>
              <div className="font-mono text-[11px] md:text-[13px] text-gray-500 leading-tight">
                voiceai.live —<br />
                call_agent.js
              </div>
            </div>
            <div className="text-right">
              <div className="text-[#27C93F] text-[11px] md:text-xs font-medium flex items-center gap-1.5 justify-end mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#27C93F]"></span>
                Live Call
              </div>
              <div className="text-[#27C93F] text-[11px] md:text-xs font-medium">
                Active
              </div>
            </div>
          </div>

          {/* Incoming Call Box */}
          <div className="bg-[#0A131C] border border-[#003B46] rounded-2xl p-5 mb-5 relative overflow-hidden">
            {/* Header row */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3 md:gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-tr from-[#59168B] to-[#00D3F3] flex items-center justify-center shadow-lg relative overflow-hidden">
                  <svg
                    className="w-7 h-7 text-black/40 mt-3"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-bold text-base md:text-lg mb-0.5">
                    Incoming Call
                  </h3>
                  <p className="text-gray-400 text-xs md:text-sm font-medium">
                    +880 1712-345678
                  </p>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full border border-[#164627] bg-[#0A2316] text-[#27C93F] text-[11px] md:text-xs font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#27C93F]"></span>
                Active
              </div>
            </div>

            {/* Waveform row */}
            <div className="flex items-center gap-5 mb-7">
              <div className="flex items-center gap-[4px] h-8">
                {[16, 28, 20, 32, 20, 36, 24, 28, 16, 20].map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [h * 0.4, h, h * 0.4] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut",
                    }}
                    className="w-2 bg-[#00D3F3] rounded-full"
                    style={{ height: h }}
                  />
                ))}
              </div>
              <span className="text-gray-400 font-mono text-xs tracking-wider">
                AI Speaking...
              </span>
            </div>

            {/* Stats row */}
            <div className="flex justify-between items-end pr-2 md:pr-4">
              <div>
                <div className="text-white font-bold text-2xl md:text-3xl leading-none mb-1.5">
                  02:34
                </div>
                <div className="text-gray-500 text-[10px] md:text-[12px] font-medium">
                  Duration
                </div>
              </div>
              <div>
                <div className="text-[#00D3F3] font-bold text-2xl md:text-3xl leading-none mb-1.5">
                  98%
                </div>
                <div className="text-gray-500 text-[10px] md:text-[12px] font-medium">
                  Confidence
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-[#27C93F] font-bold text-2xl md:text-3xl leading-none mb-1.5">
                  ✓
                </div>
                <div className="text-gray-500 text-[10px] md:text-[12px] font-medium">
                  Order Ready
                </div>
              </div>
            </div>
          </div>

          {/* 3 Bottom Cards */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <div className="bg-[#0A131C] border border-[#003B46]/60 rounded-xl p-3 md:p-4 flex flex-col items-center justify-center">
              <span className="text-[#00D3F3] font-bold italic text-xl md:text-2xl mb-1">
                127
              </span>
              <span className="text-gray-500 text-[10px] md:text-[11px] font-medium whitespace-nowrap">
                Today's Calls
              </span>
            </div>
            <div className="bg-[#0A131C] border border-[#3A1E4B]/80 rounded-xl p-3 md:p-4 flex flex-col items-center justify-center">
              <span className="text-[#AD46FF] font-bold italic text-xl md:text-2xl mb-1">
                94
              </span>
              <span className="text-gray-500 text-[10px] md:text-[11px] font-medium">
                Orders
              </span>
            </div>
            <div className="bg-[#0A131C] border border-[#164627]/80 rounded-xl p-3 md:p-4 flex flex-col items-center justify-center">
              <span className="text-[#27C93F] font-bold italic text-xl md:text-2xl mb-1">
                99.9%
              </span>
              <span className="text-gray-500 text-[10px] md:text-[11px] font-medium">
                Uptime
              </span>
            </div>
          </div>
        </div>

        {/* Overlapping Order Confirmed Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="absolute -bottom-10 right-4 sm:-right-4 md:-right-8 z-30 w-[220px] sm:w-[240px] md:w-[280px]"
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-full bg-[#0A0D14] border border-[#271E4B] rounded-2xl p-5 md:p-6 shadow-[0_30px_60px_rgba(0,0,0,0.8)]"
          >
            <div className="flex gap-3 items-center mb-5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M4 4h16v2H4V4zm0 4h16v12H4V8zm2 2v8h12v-8H6zm2 2h8v2H8v-2z"></path>
                </svg>
              </div>
              <div>
                <h4 className="text-white font-bold text-[13px] md:text-sm">
                  Order Confirmed
                </h4>
                <p className="text-gray-400 text-[10px] md:text-[11px]">
                  Email sent to customer
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-xs md:text-[13px]">
                <span className="text-gray-400 font-medium">2× Burger</span>
                <span className="text-white font-semibold">£60</span>
              </div>
              <div className="w-full h-px bg-white/5"></div>
              <div className="flex justify-between text-xs md:text-[13px]">
                <span className="text-gray-400 font-medium">1× Pizza</span>
                <span className="text-white font-semibold">£40</span>
              </div>
              <div className="w-full h-px bg-white/5"></div>
              <div className="flex justify-between text-xs md:text-[13px]">
                <span className="text-gray-400 font-medium">1× Coke</span>
                <span className="text-white font-semibold">£10</span>
              </div>
            </div>

            <div className="w-full h-px bg-white/10 mb-4"></div>

            <div className="flex justify-between items-center">
              <span className="text-[#00D3F3] font-bold text-sm md:text-base">
                Total
              </span>
              <span className="text-[#00D3F3] font-bold text-sm md:text-base">
                £110
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default BannerGraphic;
