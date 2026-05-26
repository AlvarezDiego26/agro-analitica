import { randomBytes, scryptSync, timingSafeEqual, createHash } from "node:crypto";

const SCRYPT_KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return `scrypt:${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [algorithm, salt, savedKey] = storedHash.split(":");

  if (algorithm !== "scrypt" || !salt || !savedKey) {
    return false;
  }

  const derivedKey = scryptSync(password, salt, SCRYPT_KEYLEN);
  const savedBuffer = Buffer.from(savedKey, "hex");

  if (savedBuffer.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(savedBuffer, derivedKey);
}

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
