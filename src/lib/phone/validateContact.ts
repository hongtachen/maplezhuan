import { CONTACT_ERRORS } from "./constants";
import { validatePhone } from "./validatePhone";

export type ContactPairValidationResult =
  | { ok: true; phoneE164: string }
  | { ok: false; error: string; field: "phone" | "contact" };

export function validateContactPair(input: {
  phone: string;
  wechat: string;
}): ContactPairValidationResult {
  const wechat = input.wechat.trim();
  const phoneRaw = input.phone.trim();

  if (!wechat && !phoneRaw) {
    return {
      ok: false,
      error: CONTACT_ERRORS.atLeastOne,
      field: "contact",
    };
  }

  if (phoneRaw) {
    const phoneResult = validatePhone(phoneRaw, { required: false });
    if (!phoneResult.ok) {
      return {
        ok: false,
        error: phoneResult.error,
        field: "phone",
      };
    }
    return { ok: true, phoneE164: phoneResult.e164 };
  }

  return { ok: true, phoneE164: "" };
}
