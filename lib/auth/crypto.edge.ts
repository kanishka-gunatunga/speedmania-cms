// Timing-safe string comparison helper (fully Edge runtime compatible)
export function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

const SESSION_SECRET = process.env.SESSION_SECRET || "speedmania-secret-fallback-2026-key";

function hex(buffer: ArrayBuffer): string {
  const hashArray = Array.from(new Uint8Array(buffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(SESSION_SECRET),
    { name: "HMAC", hash: { name: "SHA-256" } },
    false,
    ["sign"]
  );
}

// Asynchronous token signing
export async function signToken(payload: string): Promise<string> {
  const key = await getCryptoKey();
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  const signature = hex(signatureBuffer);
  return `${payload}.${signature}`;
}

// Asynchronous token verification
export async function verifyToken(token: string): Promise<string | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [payload, signature] = parts;
    
    const key = await getCryptoKey();
    const expectedSignatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(payload)
    );
    const expectedSignature = hex(expectedSignatureBuffer);
    
    if (timingSafeEqualString(signature, expectedSignature)) {
      return payload;
    }
  } catch (e) {}
  return null;
}

// Edge-compatible user authentication retriever from request headers
export async function getAuthUser(request: Request): Promise<{ id: string; username: string } | null> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
    const token = authHeader.substring(7);
    const payload = await verifyToken(token);
    if (!payload) return null;
    
    const [id, username, expiryStr] = payload.split(":");
    const expiry = parseInt(expiryStr, 10);
    
    if (Date.now() > expiry) return null;
    return { id, username };
  } catch (e) {
    return null;
  }
}
