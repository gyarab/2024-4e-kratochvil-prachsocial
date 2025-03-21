import Image from "next/image";
import avatarPlaceholder from "@/assets/avatar-placeholder.png";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  avatarUrl: string | null | undefined; // URL avataru uzivatele
  size?: number; // Volitelna velikost v pixelech
  className?: string; // Dodatecne CSS tridy
}

export default function UserAvatar({
  avatarUrl,
  size,
  className,
}: UserAvatarProps) {
  return (
    <Image
      src={avatarUrl || avatarPlaceholder} // Pokud avatar neexistuje, pouzije placeholder
      alt="Avatar"
      width={size ?? 48} // Defaultni sirka 48px
      height={size ?? 48} // Defaultni vyska 48px
      className={cn(
        "aspect-square h-fit flex-none rounded-full bg-secondary object-cover",
        className,
      )}
    />
  );
}
