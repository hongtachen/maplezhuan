export const DEFAULT_PHONE_COUNTRY = "CA" as const;

export type SupportedPhoneCountry = typeof DEFAULT_PHONE_COUNTRY | "CN";

export const PHONE_PLACEHOLDER = "6471234567 或 +86 13812345678";

export const PHONE_ERRORS = {
  required: "请填写手机号",
  invalid: "请输入有效的手机号（加拿大或 +86 中国号）",
} as const;

export const CONTACT_ERRORS = {
  atLeastOne: "请至少填写一项联系方式（微信号或手机号）",
} as const;
