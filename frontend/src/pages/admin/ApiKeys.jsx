import React, { useState } from "react";
import { Icon } from "@iconify/react";

const ApiKeys = () => {
  const [showKey, setShowKey] = useState(false);

  const fullKey =
    "_live_3b82f9d3a1b2c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7d9e1f3a5";
  const maskedKey =
    "_live_3b82••••••••••••••••••••••••••••••••••••••••••••••••••••d9e1f3a5";

  const handleCopy = () => {
    navigator.clipboard.writeText(fullKey);
  };

  return (
    <div>
      <div className="bg-[#191919] rounded-2xl p-6 border border-gray-800/50">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-white text-[17px] font-medium mb-1">
              Your API Key
            </h2>
            <p className="text-gray-400 text-[13px]">
              Use this key to authenticate API requests
            </p>
          </div>
          <button className="bg-[#2563EB] hover:bg-blue-600 text-white text-[13px] font-medium px-5 py-1.5 rounded-full transition-colors">
            Active
          </button>
        </div>

        {/* API Key Input Section */}
        <div className="mb-8">
          <label className="block text-[13px] text-white mb-3">API Key</label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                readOnly
                value={showKey ? fullKey : maskedKey}
                className="w-full bg-[#151515] border border-gray-700/50 rounded-xl px-4 py-2.5 text-gray-300 text-sm outline-none font-mono tracking-wider"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
              >
                <Icon
                  icon={showKey ? "lucide:eye-off" : "lucide:eye"}
                  className="text-lg"
                />
              </button>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 bg-[#151515] border border-gray-700/50 hover:bg-gray-800 transition-colors rounded-xl px-5 py-2.5 text-gray-300 text-sm font-medium"
            >
              <Icon icon="lucide:copy" className="text-lg" />
              Copy
            </button>
          </div>
        </div>

        {/* Dates Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <span className="block text-gray-400 text-xs mb-1.5">Created</span>
            <span className="text-gray-200 text-[13px] font-medium">
              2026-01-15
            </span>
          </div>
          <div className="text-right">
            <span className="block text-gray-400 text-xs mb-1.5">
              Last Used
            </span>
            <span className="text-gray-200 text-[13px] font-medium">
              2026-02-23
            </span>
          </div>
        </div>

        {/* Action Buttons Section */}
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-[#151515] border border-gray-700/50 hover:bg-gray-800 transition-colors rounded-xl px-4 py-2 text-gray-300 text-[13px] font-medium">
            <Icon icon="lucide:refresh-cw" className="text-sm" />
            Resync
          </button>
          <button className="flex items-center gap-2 bg-[#151515] border border-gray-700/50 hover:bg-gray-800 transition-colors rounded-xl px-4 py-2 text-gray-300 text-[13px] font-medium">
            <Icon icon="lucide:key" className="text-sm" />
            Revoke
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeys;
