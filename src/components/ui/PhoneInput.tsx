"use client";

import { FEEDBACK, inlineFeedback } from "@/lib/feedback/styles";
import {
  DEFAULT_PHONE_COUNTRY,
  getPhoneCountryOption,
  PHONE_COUNTRY_OPTIONS,
  type SupportedPhoneCountry,
} from "@/lib/phone/constants";
import { sanitizePhoneInput } from "@/lib/phone/validatePhone";

type PhoneInputProps = {
  value: string;
  onChange: (value: string) => void;
  country?: SupportedPhoneCountry;
  onCountryChange?: (country: SupportedPhoneCountry) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  onBlur?: () => void;
  showError?: boolean;
};

const defaultShellClass =
  "flex w-full items-stretch overflow-hidden rounded-[16px] border border-transparent bg-[#f7f9fc] transition-all focus-within:border-[#2f9e6d] focus-within:bg-white";

export default function PhoneInput({
  value,
  onChange,
  country = DEFAULT_PHONE_COUNTRY,
  onCountryChange,
  error,
  disabled,
  placeholder,
  className,
  onBlur,
  showError = true,
}: PhoneInputProps) {
  const hasError = !!error;
  const option = getPhoneCountryOption(country);
  const shellClass =
    className ??
    `${defaultShellClass} ${
      hasError
        ? "border-rose-300 bg-rose-50/40 focus-within:border-rose-400 focus-within:bg-white"
        : ""
    }`;

  return (
    <div className="w-full">
      <div className={shellClass}>
        <label className="relative shrink-0">
          <span className="sr-only">手机区号</span>
          <select
            value={country}
            disabled={disabled}
            aria-label="手机区号"
            className="h-full appearance-none bg-transparent pl-3.5 pr-7 text-[14px] font-medium text-[#1f2933] outline-none disabled:opacity-60"
            onChange={(e) =>
              onCountryChange?.(e.target.value as SupportedPhoneCountry)
            }
          >
            {PHONE_COUNTRY_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.dialCode} {item.label}
              </option>
            ))}
          </select>
          <span
            aria-hidden
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#5a6b73]"
          >
            ▾
          </span>
        </label>
        <div
          aria-hidden
          className="my-2.5 w-px shrink-0 bg-[rgba(31,41,51,0.12)]"
        />
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          value={value}
          disabled={disabled}
          placeholder={placeholder ?? option.placeholder}
          className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-[15px] text-[#1f2933] outline-none disabled:opacity-60"
          onBlur={onBlur}
          onChange={(e) => onChange(sanitizePhoneInput(e.target.value))}
          aria-invalid={hasError}
          aria-describedby={hasError ? "phone-input-error" : undefined}
        />
      </div>
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
