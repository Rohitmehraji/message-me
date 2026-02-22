import { e164Regex } from "./validation.js";

export const normalizePhone = (value: string): string | null => {
  const sanitized = value.replace(/[\s()-]/g, "");
  if (!e164Regex.test(sanitized)) return null;
  return sanitized;
};
