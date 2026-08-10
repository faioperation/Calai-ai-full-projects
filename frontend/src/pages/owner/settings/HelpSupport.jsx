import React from "react";
import Breadcrumb from "../../../components/Breadcrumb";
import { Mail, Phone } from "lucide-react";

const HelpSupport = () => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Breadcrumb text="Get assistance and contact our support team" />

      <div className="mt-8 bg-[#191919] border border-[#272727] rounded-3xl p-6 sm:p-8 max-w-xl">
        <h3 className="text-xl font-bold text-white mb-6">Contact</h3>

        <div className="flex flex-col gap-6">
          {/* Phone Number */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">
                Business Number
              </p>
              <p className="text-white text-[15px] font-semibold">
                +447719436543
              </p>
            </div>
          </div>

          <div className="w-full h-px bg-white/5" />

          {/* Email */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">
                Business Email
              </p>
              <a
                href="mailto:hello@calai.info"
                className="text-white text-[15px] font-semibold hover:text-blue-400 transition-colors"
              >
                hello@calai.info
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;
