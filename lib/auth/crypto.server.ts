import { scryptSync, randomBytes } from "crypto";
import { timingSafeEqualString } from "./crypto.edge";

// ── Password Hashing ──
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, hash] = storedHash.split(":");
    if (!salt || !hash) return false;
    const verifyHash = scryptSync(password, salt, 64).toString("hex");
    return timingSafeEqualString(hash, verifyHash);
  } catch (e) {
    return false;
  }
}
