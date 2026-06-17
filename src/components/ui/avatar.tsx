import { getAvatarUrl } from "@/lib/utils/avatar";

interface AvatarProps {
  avatarPath: string | null;
  name: string;
  size?: number;
  className?: string;
}

export function Avatar({
  avatarPath,
  name,
  size = 32,
  className = "",
}: AvatarProps) {
  const url = getAvatarUrl(avatarPath);
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full font-bold ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: "var(--color-gold)",
        color: "var(--color-ivory)",
        fontSize: size * 0.35,
      }}
    >
      {initials}
    </div>
  );
}
