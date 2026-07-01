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

function parsePhone(
  raw: string,
  defaultCountry: SupportedPhoneCountry = DEFAULT_PHONE_COUNTRY,
) {
  const trimmed = raw.trim();
  if (!trimmed) return null;

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

export function sanitizePhoneInput(value: string): string {
  return value.replace(/[^\d+\s\-()]/g, "");
}
