export const DEFAULT_PHONE_COUNTRY = "CA" as const;

export type SupportedPhoneCountry = typeof DEFAULT_PHONE_COUNTRY | "CN";

export const PHONE_COUNTRY_OPTIONS: ReadonlyArray<{
  value: SupportedPhoneCountry;
  dialCode: string;
  label: string;
  placeholder: string;
}> = [
  {
    value: "CA",
    dialCode: "+1",
    label: "加拿大",
    placeholder: "6471234567",
  },
  {
    value: "CN",
    dialCode: "+86",
    label: "中国",
    placeholder: "13812345678",
  },
] as const;

export const PHONE_PLACEHOLDER = "6471234567";

export const PHONE_ERRORS = {
  required: "请填写手机号",
  invalid: "请输入有效的手机号",
} as const;

export const CONTACT_ERRORS = {
  atLeastOne: "请至少填写一项联系方式（微信号或手机号）",
} as const;

export function getPhoneCountryOption(country: SupportedPhoneCountry) {
  return (
    PHONE_COUNTRY_OPTIONS.find((option) => option.value === country) ??
    PHONE_COUNTRY_OPTIONS[0]
  );
}
