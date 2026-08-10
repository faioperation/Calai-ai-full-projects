import Breadcrumb from "@/components/Breadcrumb";
import React, { useState } from "react";
import UploadPdf from "@/components/UploadPdf";
import RecentTrainingList from "@/components/RecentTrainingList";
import SpecialOfferUpload from "@/components/SpecialOfferUpload";

const AiTraining = () => {
  const [activeTab, setActiveTab] = useState("training");

  return (
    <div>
      <Breadcrumb
        text={`Train your AI assistant with voice and text to enhance its capabilities`}
      />

      <div className="mt-6">
        {/* Tabs */}
        <div className="flex space-x-6 border-b border-gray-800 mb-6 px-1">
          <button
            onClick={() => setActiveTab("training")}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "training"
                ? "border-blue-500 text-blue-500"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            Agent Training
          </button>
          <button
            onClick={() => setActiveTab("specialOffer")}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "specialOffer"
                ? "border-blue-500 text-blue-500"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            Special Offers
          </button>
        </div>

        {/* Content Area */}
        {activeTab === "training" && (
          <div>
            <div>
              <UploadPdf />
            </div>
            {/* Recent Training List */}
            <RecentTrainingList />
          </div>
        )}

        {activeTab === "specialOffer" && (
          <div>
            <SpecialOfferUpload />
          </div>
        )}
      </div>
    </div>
  );
};

export default AiTraining;
