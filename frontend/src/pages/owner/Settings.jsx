import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

const Settings = () => {
  const location = useLocation();

  const tabs = [
    { name: "Profile Settings", path: "/owner/settings/profile" },
    { name: "Connect email & number", path: "/owner/settings/connect" },
    { name: "Business Info", path: "/owner/settings/business" },
    { name: "Subscription", path: "/owner/settings/subscription" },
    { name: "Privacy Setting", path: "/owner/settings/privacy" },
    { name: "Help & Support", path: "/owner/settings/help" },
  ];

  const isActivePath = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <div className="flex flex-col h-full min-h-[80vh]">
      <div className="w-full border-b border-[#262626] mb-8 bg-[#141416]">
        <div className="flex flex-wrap gap-x-4 gap-y-2 md:gap-x-8 px-2 md:px-0 pt-2">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={`whitespace-nowrap flex items-center pb-3 text-[13px] md:text-sm font-medium transition-all border-b-2 ${
                isActivePath(tab.path)
                  ? "border-[#0F42FF] text-white"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              {tab.name}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pb-6 ">
        <Outlet />
      </div>
    </div>
  );
};

export default Settings;
