export function getAvatarUrl(avatarPath: string | null): string | null {
  if (!avatarPath) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${avatarPath}`;
}
