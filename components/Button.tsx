import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export default function Button({ 
  children, 
  variant = "primary",
  className = "",
  disabled,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={`
        px-4 py-2 rounded-lg font-medium transition-all
        ${variant === "primary" 
          ? "bg-blue-600 text-white hover:bg-blue-700" 
          : "bg-gray-200 text-gray-800 hover:bg-gray-300"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
