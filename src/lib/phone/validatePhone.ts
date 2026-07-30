import {
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";
import {
  DEFAULT_PHONE_COUNTRY,
  PHONE_ERRORS,
  type SupportedPhoneCountry,
} from "./constants";

export type PhoneValidationResult =
  | { ok: true; e164: string }
  | { ok: false; error: string };

type ValidatePhoneOptions = {
  required?: boolean;
  defaultCountry?: SupportedPhoneCountry;
};

function toSupportedCountry(
  country: string | undefined,
): SupportedPhoneCountry {
  return country === "CN" ? "CN" : DEFAULT_PHONE_COUNTRY;
}

function parsePhone(
  raw: string,
  defaultCountry: SupportedPhoneCountry = DEFAULT_PHONE_COUNTRY,
) {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // National digits (no leading +): parse with the selected country.
  if (!trimmed.startsWith("+")) {
    return parsePhoneNumberFromString(trimmed, defaultCountry as CountryCode);
  }

  const international = parsePhoneNumberFromString(trimmed);
  if (international?.isValid()) return international;

  return parsePhoneNumberFromString(trimmed, defaultCountry as CountryCode);
}

export function validatePhone(
  raw: string,
  options?: ValidatePhoneOptions,
): PhoneValidationResult {
  const trimmed = raw.trim();
  const required = options?.required ?? false;
  const defaultCountry = options?.defaultCountry ?? DEFAULT_PHONE_COUNTRY;

  if (!trimmed) {
    if (required) {
      return { ok: false, error: PHONE_ERRORS.required };
    }
    return { ok: true, e164: "" };
  }

  const parsed = parsePhone(trimmed, defaultCountry);
  if (!parsed?.isValid()) {
    return { ok: false, error: PHONE_ERRORS.invalid };
  }

  // Keep numbers within the two supported dial regions.
  const supported = toSupportedCountry(parsed.country);
  if (defaultCountry === "CN" && supported !== "CN") {
    return { ok: false, error: PHONE_ERRORS.invalid };
  }
  if (defaultCountry === "CA" && supported === "CN") {
    return { ok: false, error: PHONE_ERRORS.invalid };
  }

  return { ok: true, e164: parsed.format("E.164") };
}

export function normalizePhone(
  raw: string,
  defaultCountry: SupportedPhoneCountry = DEFAULT_PHONE_COUNTRY,
): string | null {
  const result = validatePhone(raw, { required: false, defaultCountry });
  if (!result.ok) return null;
  return result.e164 || null;
}

export function formatPhoneForDisplay(raw: string): string {
  const trimmed = raw?.trim();
  if (!trimmed) return raw;

  const parsed =
    parsePhoneNumberFromString(trimmed) ??
    parsePhoneNumberFromString(trimmed, DEFAULT_PHONE_COUNTRY);

  if (parsed?.isValid()) {
    return parsed.formatNational();
  }

  return raw;
}

export function splitPhoneForInput(raw: string): {
  country: SupportedPhoneCountry;
  nationalNumber: string;
} {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) {
    return { country: DEFAULT_PHONE_COUNTRY, nationalNumber: "" };
  }

  const parsed =
    parsePhoneNumberFromString(trimmed) ??
    parsePhoneNumberFromString(trimmed, DEFAULT_PHONE_COUNTRY);

  if (parsed?.isValid()) {
    return {
      country: toSupportedCountry(parsed.country),
      nationalNumber: parsed.nationalNumber,
    };
  }

  if (trimmed.startsWith("+86")) {
    return {
      country: "CN",
      nationalNumber: trimmed.replace(/^\+86/, "").replace(/\D/g, ""),
    };
  }

  if (trimmed.startsWith("+1")) {
    return {
      country: DEFAULT_PHONE_COUNTRY,
      nationalNumber: trimmed.replace(/^\+1/, "").replace(/\D/g, ""),
    };
  }

  return {
    country: DEFAULT_PHONE_COUNTRY,
    nationalNumber: trimmed.replace(/\D/g, ""),
  };
}

export function sanitizePhoneInput(value: string): string {
  return value.replace(/[^\d\s\-()]/g, "");
}
