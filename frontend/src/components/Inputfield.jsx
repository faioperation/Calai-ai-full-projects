import React from 'react'

const InputField = ({
  label,
  className,
  placeholder,
  inputClass,
  labelClass,
  value,
  onChange,
  type,
  leftIcon,
  ...props
}) => {
  return (
    <div className={`flex flex-col w-full gap-2 ${className}`}>
      <label className={`font-inter  text-[#364153]  ${labelClass}`}>
        {label}
      </label>

      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}           
          onChange={onChange}     
          className={`w-full border border-[#D1D5DC] outline-none p-4 text-[#364153] placeholder:text-[#0A0A0A]/50 rounded-2xl ${leftIcon ? 'pl-11' : ''} ${inputClass}`}
          {...props}
        />
      </div>
    </div>
  );
}

export default InputField;

