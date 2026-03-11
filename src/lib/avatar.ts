/**
 * 頭像顯示邏輯：與主流應用一致，優先頭像 URL，否則顯示首字母
 */
import type { User } from '@supabase/supabase-js';

export function getAvatarUrl(
  profileAvatarUrl: string | null | undefined,
  user: User | null
): string | null {
  if (profileAvatarUrl) return profileAvatarUrl;
  if (!user) return null;
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  return (meta?.avatar_url as string) ?? (meta?.picture as string) ?? null;
}

export function getDisplayInitials(displayName: string | null | undefined, email?: string | null): string {
  if (displayName?.trim()) {
    const first = displayName.trim().charAt(0);
    return first.toUpperCase();
  }
  if (email) return email.charAt(0).toUpperCase();
  return '?';
}
