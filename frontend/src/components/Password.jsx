"use client";
import React, { useState } from "react";
import { FaRegEyeSlash } from "react-icons/fa";
import { IoEyeOutline } from "react-icons/io5";

const Password = ({
  label,
  placeholder,
  className = "",
  labelClass = "",
  icon = "",
  inputClass = "",
  value,
  onChange,
  name, // optional: "password" or "password_confirmation"
  leftIcon,
  ...props
}) => {
  const [showPass, setShowPass] = useState(false);

  return (
    <div className={`flex flex-col gap-2 w-full ${className}`}>
      {label && (
        <label className={`font-inter text-[#364153]  ${labelClass}`}>
          {label}
        </label>
      )}

      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
            {leftIcon}
          </div>
        )}
        <input
          name={name}
          type={showPass ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full outline-none p-4 text-[#364153]  font-inter text-[16px] placeholder-[#0A0A0A]/50 border border-[#D1D5DC]  rounded ${leftIcon ? 'pl-11' : ''} ${inputClass}`}
          aria-label={label || "password"}
          autoComplete={name === "password" ? "new-password" : "off"}
          {...props}
        />

        <button
          type="button"
          onClick={() => setShowPass((s) => !s)}
          aria-pressed={showPass}
          aria-label={showPass ? "Hide password" : "Show password"}
          className={`w-8 h-8 flex items-center justify-center absolute top-1/2 -translate-y-1/2 right-3 text-[#364153]  ${icon}`}
        >
          {showPass ? <IoEyeOutline className="w-5 h-5" /> : <FaRegEyeSlash className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

export default Password;