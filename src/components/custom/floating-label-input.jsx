"use client"

import  React, { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const FloatingLabelInput = ({
  id,
  label,
  register,
  onChange,
  value,
  type = "text",
  icon,
  isFocused,
  setIsFocused,
  watchedValue,
  showToggle = false,
  toggleState = false,
  onToggle = () => {},
  isValid = false,
  errors,
  ...props
}) => {
  // Internal state for uncontrolled inputs
  const [internalValue, setInternalValue] = useState("")

  // Only controlled if value or watchedValue is provided
  const isControlled = value !== undefined || watchedValue !== undefined

  // Use appropriate value based on controlled/uncontrolled state
  const inputValue = isControlled
    ? (value !== undefined ? value : watchedValue || "")
    : internalValue

  // Handle change events
  const handleChange = (e) => {
    if (!isControlled) {
      setInternalValue(e.target.value)
    }
    // Call external onChange if provided
    if (onChange) {
      onChange(e)
    } else if (register?.onChange) {
      register.onChange(e)
    }
  }
  
  const isDisabled = !!props?.disabled

  return (
    <div className="relative mb-6">
      {icon && (
        <div className="absolute z-10 -translate-y-1/2 left-3 top-1/2">
          <div className="text-[#0077B6] w-5 h-5 flex items-center justify-center">{icon}</div>
        </div>
      )}

      <Input
        id={id}
        type={type === "password" && showToggle ? (toggleState ? "text" : "password") : type}
        {...(isControlled ? { value: inputValue } : { defaultValue: inputValue })}
        onChange={handleChange}
        onFocus={(e) => {
          setIsFocused?.(true);
          register?.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused?.(false);
          register?.onBlur?.(e);
        }}
        className={`!h-14 ${icon ? "!pl-11" : "!pl-3"} !pr-3 !pt-4 !rounded !focus:ring-0 !focus:outline-none !focus:ring-offset-0 bg-white
          ${
            errors
              ? "!border-red-500 !focus:border-red-500"
              : isValid
                ? "!border-[#0077B6] !focus:border-[#0077B6]"
                : "!border-[#000000] !focus:border-[#000000]"
          }
          ${isDisabled ? "opacity-60 cursor-not-allowed hover:bg-gray-50 disabled:hover:bg-gray-50" : ""}`}
        {...(register ? register : {})}
        {...props}
      />

      <Label
        htmlFor={id}
        className={`absolute transform duration-200 ${icon ? "left-11" : "left-3"} px-1 bg-white rounded pointer-events-none
          ${isFocused || inputValue?.length > 0
             ? "-translate-y-2 top-2 text-xs z-10" 
             : "top-1/2 -translate-y-1/2"
            }
          ${errors 
            ? "text-red-500" 
            : isValid 
            ? "text-[#0077B6]" 
            : isDisabled ? "text-gray-400" : "text-[#000000]"
         }`}
      >
        {label}
      </Label>

      {type === "password" && showToggle && (
        <div
          className="absolute right-3 top-[50%] -translate-y-1/2 flex items-center justify-center cursor-pointer"
          onClick={onToggle}
        >
          {toggleState ? (
            <EyeOff className={`w-5 h-5
                ${
                   errors 
                   ? "!text-red-500" 
                   : isValid 
                   ? "!text-[#0077B6]" 
                   : "text-[#000000]"
               }`}
            />
          ) : (
            <Eye className={`w-5 h-5
                ${
                  errors 
                  ? "!text-red-500" 
                  : isValid 
                  ? "!text-[#0077B6]" 
                  : "!text-[#000000]"
               }`}
            />
          )}
        </div>
      )}

      {errors && <p className="absolute text-xs text-red-500 text-start -bottom-5">{errors.message}</p>}
    </div>
  )
}
