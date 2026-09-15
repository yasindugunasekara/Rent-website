import { hash, verify } from "@node-rs/argon2";

// argon2id, tuned for a web request budget (~19 MiB memory, t=2, 1 lane).
// OWASP's minimum recommended argon2id profile.
const ARGON2_OPTS = {
  memoryCost: 19456, // 19 MiB
  timeCost: 2,
  parallelism: 1,
} as const;

export async function hashPassword(password: string): Promise<string> {
  return hash(password, ARGON2_OPTS);
}

export async function verifyPassword(hashValue: string, password: string): Promise<boolean> {
  try {
    return await verify(hashValue, password, ARGON2_OPTS);
  } catch {
    return false;
  }
}

// A hash of a value nobody will ever type, used to burn the same amount of
// time as a real verification when the account doesn't exist — otherwise
// login response time reveals whether an email is registered. Computed once
// lazily (not hardcoded) so it's always a valid, correctly-tuned hash.
let dummyHashPromise: Promise<string> | null = null;

export async function burnPasswordVerifyTime(): Promise<void> {
  if (!dummyHashPromise) {
    dummyHashPromise = hashPassword("no-account-has-this-password-ever");
  }
  const dummyHash = await dummyHashPromise;
  await verifyPassword(dummyHash, "irrelevant-timing-decoy");
}
