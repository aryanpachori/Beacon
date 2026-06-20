/**
 * Returns a ui-avatars.com URL — free, no API key, generates a letter avatar
 * from the user's name. Falls back to email initials if no name.
 */
export function avatarUrl(name: string, email: string, size = 80): string {
  const seed = name.trim() || email.trim().split('@')[0] || 'User'
  const encoded = encodeURIComponent(seed)
  return `https://ui-avatars.com/api/?name=${encoded}&size=${size}&background=2f7eda&color=fff&bold=true&rounded=true`
}
