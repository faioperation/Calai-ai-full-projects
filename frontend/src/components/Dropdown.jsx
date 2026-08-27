"use client";
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FaCaretDown, FaCaretUp } from "react-icons/fa";

const Dropdown = ({
  label = "",
  placeholder = "",
  options = [],
  onSelect,
  className,
  inputClass,
  spanClass,
  optionClass,
  labelClass,
  icon,
  value
}) => {
  const [selected, setSelected] = useState(value || "");

  useEffect(() => {
    if (value) {
      setSelected(value);
    }
  }, [value]);
  const [show, setShow] = useState(false);
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);
  const [coords, setCoords] = useState(null);

  const handleSelect = (item) => {
    const val = typeof item === "object" && item !== null ? item.value : item;
    setSelected(val);
    setShow(false);
    if (onSelect) onSelect(val);
  };

  const getDisplayValue = () => {
    if (!selected) return "";
    const option = options.find(
      (opt) => (typeof opt === "object" && opt !== null ? opt.value : opt) === selected
    );
    if (option) {
      return typeof option === "object" && option !== null ? option.label : option;
    }
    return selected;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        (!menuRef.current || !menuRef.current.contains(event.target))
      ) {
        setShow(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const updatePosition = () => {
      if (show && dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect();
        setCoords({
          left: rect.left,
          top: rect.bottom + 4,
          width: rect.width,
        });
      }
    };

    updatePosition();
    if (show) {
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
    }
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [show]);

  return (
    <div
      ref={dropdownRef}
      className={`flex flex-col gap-2   relative ${className}`}
    >
      {/* Label */}
      {label && (
        <label className={`font-inter text-[#364153]   ${labelClass}`}>
          {label}
        </label>
      )}


      {/* Input Box */}
      <div className="relative">
        <div onClick={() => setShow(!show)}>
          <input
            readOnly
            value={getDisplayValue()}
            className={`w-full bg-transparent outline-none text-[#364153] border border-[#D1D5DC] p-4 rounded-lg  placeholder:text-[#0A0A0A]/50    cursor-pointer ${inputClass}`}
            placeholder={placeholder}
          />

          {/* Arrow Icon */}
          <div className={`w-6 h-6  flex items-center justify-center absolute top-1/2 -translate-y-1/2 right-6 text-[#000000]  ${icon}`}>
            {show ? <FaCaretUp /> : <FaCaretDown />}
          </div>
        </div>

        {/* Dropdown Menu */}
        {typeof document !== "undefined" && createPortal(
          <div
            ref={menuRef}
            style={coords ? { position: "fixed", top: coords.top, left: coords.left, width: coords.width } : { display: "none" }}
            className={`bg-white border border-[#D1D5DC] rounded-md shadow-md text-[#000000] z-[9999] transition-all duration-300 text-center overflow-y-scroll hide-scrollbar ${optionClass} ${
              show
                ? "opacity-100 visible max-h-60"
                : "opacity-0 invisible max-h-0"
            }`}
          >
            {options.map((item, index) => {
              const isObj = typeof item === "object" && item !== null;
              const label = isObj ? item.label : item;
              return (
                <div
                  key={index}
                  onClick={() => handleSelect(item)}
                  className={`py-2 cursor-pointer hover:bg-[#152483] hover:text-white `}
                >
                  {label}
                </div>
              );
            })} 
          </div>,
          document.body
        )}
      </div>
    </div>
  );
};

export default Dropdown;



