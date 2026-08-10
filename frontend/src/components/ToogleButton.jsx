"use client";
import React from "react";

export default function ToggleButton({ isAnnual, setIsAnnual }) {
  return (
    <div className="flex items-center justify-center gap-3 ">
      {/* Monthly Label */}
      <span
        className={` text-2xl ${
          !isAnnual ? "text-[#ffffff]" : "text-gray-500"
        }`}
      >
        Monthly
      </span>

      {/* Toggle Switch */}
      <button
        onClick={() => setIsAnnual(!isAnnual)}
        className={`relative w-13 h-7 flex items-center rounded-full transition-colors duration-300 cursor-pointer ${
          isAnnual ? "bg-[#00135B]" : "bg-[#D1D5DC]"
        }`}
      >
        <span
          className={`absolute w-5 h-5 rounded-full transition-transform duration-300 ${
            isAnnual ? "md:translate-x-7 translate-x-7 bg-white" : "md:translate-x-1 translate-x-1 bg-white"
          }`}
        ></span>
      </button>

      {/* Yearly Label */}
      <span
        className={`text-2xl ${
          isAnnual ? "text-[#ffffff]" : "text-gray-500"
        }`}
      >
        Yearly
      </span>
    </div>
  );
}