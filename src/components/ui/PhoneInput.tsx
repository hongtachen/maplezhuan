"use client";

import { FEEDBACK, inlineFeedback } from "@/lib/feedback/styles";
import { PHONE_PLACEHOLDER } from "@/lib/phone/constants";
import { sanitizePhoneInput } from "@/lib/phone/validatePhone";

type PhoneInputProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  onBlur?: () => void;
  showError?: boolean;
};

const defaultInputClass =
  "w-full bg-[#f7f9fc] border rounded-[16px] pl-11 pr-4 py-3.5 text-[15px] outline-none transition-all border-transparent focus:bg-white focus:border-[#2f9e6d]";

export default function PhoneInput({
  value,
  onChange,
  error,
  disabled,
  placeholder = PHONE_PLACEHOLDER,
  className,
  onBlur,
  showError = true,
}: PhoneInputProps) {
  const hasError = !!error;
  const inputClass =
    className ??
    `${defaultInputClass} ${
      hasError
        ? "border-rose-300 bg-rose-50/40 focus:bg-white focus:border-rose-400"
        : ""
    }`;

  return (
    <div className="w-full">
      <input
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        className={inputClass}
        onBlur={onBlur}
        onChange={(e) => onChange(sanitizePhoneInput(e.target.value))}
        aria-invalid={hasError}
        aria-describedby={hasError ? "phone-input-error" : undefined}
      />
      {showError && error && (
        <p
          id="phone-input-error"
          role="alert"
          className={`${inlineFeedback} ${FEEDBACK.error.text} px-1 mt-1.5`}
        >
          {error}
        </p>
      )}
    </div>
  );
}
