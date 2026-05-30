import type { Profile } from "@/lib/types";

// Couleurs douces déterministes selon le prénom
const PALETTE = [
  "bg-ocean-500",
  "bg-marais-500",
  "bg-sable-300",
  "bg-ocean-600",
  "bg-marais-600",
  "bg-ocean-400",
];

function colorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function Avatar({
  profile,
  size = 48,
  className = "",
}: {
  profile: Pick<Profile, "name" | "avatar_url">;
  size?: number;
  className?: string;
}) {
  const initials = profile.name.slice(0, 2).toUpperCase();
  if (profile.avatar_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={profile.avatar_url}
        alt={profile.name}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className={`rounded-full object-cover ${className}`}
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      className={`flex items-center justify-center rounded-full font-semibold text-white ${colorFor(
        profile.name,
      )} ${className}`}
    >
      {initials}
    </div>
  );
}
