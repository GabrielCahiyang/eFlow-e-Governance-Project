// ─── Reusable Form Components ────────────────────────────────────
import React from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
}

export function FormField({ label, error, children, required }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-medium text-[#676879] uppercase tracking-wider">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <span className="text-[11px] font-normal text-red-500">{error}</span>
      )}
    </div>
  );
}

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export function TextInput({ hasError, className = "", ...props }: TextInputProps) {
  return (
    <input
      className={`w-full h-10 px-3 rounded-lg border text-[13px] font-normal text-[#323338] placeholder:text-neutral-400 outline-none transition-all ${
        hasError
          ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
          : "border-neutral-200 bg-neutral-50 focus:border-neutral-400 focus:ring-1 focus:ring-neutral-200"
      } ${className}`}
      {...props}
    />
  );
}

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function SelectInput({ hasError, options, placeholder, className = "", ...props }: SelectInputProps) {
  return (
    <select
      className={`w-full h-10 px-3 rounded-lg border text-[13px] font-normal text-[#323338] outline-none transition-all cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center] bg-[length:12px] ${
        hasError
          ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
          : "border-neutral-200 bg-neutral-50 focus:border-neutral-400 focus:ring-1 focus:ring-neutral-200"
      } ${className}`}
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M6 8L1 3h10z' fill='%23999'/%3E%3C/svg%3E")` }}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
