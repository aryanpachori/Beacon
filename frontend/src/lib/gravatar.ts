/**
 * Generates a DiceBear Dylan avatar URL.
 * Dylan produces illustrated character avatars — deterministic from the seed.
 * Docs: https://www.dicebear.com/styles/dylan/
 */
export function avatarUrl(name: string, email: string, size = 80): string {
  const seed = encodeURIComponent((name.trim() || email.trim()).toLowerCase())
  return `https://api.dicebear.com/9.x/dylan/png?seed=${seed}&size=${size}`
}
