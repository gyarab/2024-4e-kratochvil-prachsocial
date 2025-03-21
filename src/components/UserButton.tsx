"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "./ui/dropdown-menu";
import UserAvatar from "./UserAvatar";
import Link from "next/link";
import { Check, LogOutIcon, Monitor, Moon, Sun, UserIcon } from "lucide-react";
import { logout } from "@/app/(auth)/actions";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useQueryClient } from "@tanstack/react-query";

interface UserButtonProps {
  className?: string; // Dodatecne CSS tridy
}

export default function UserButton({ className }: UserButtonProps) {
  const { user } = useSession(); // Ziskame data prihlaseneho uzivatele
  const { theme, setTheme } = useTheme(); // Hook pro praci s tematem (dark/light mode)
  const queryClient = useQueryClient(); // Pristup k React Query cache

  return (
    <DropdownMenu>
      {/* Trigger dropdown menu - avatar uzivatele */}
      <DropdownMenuTrigger asChild>
        <button className={cn("flex-none rounded-full", className)}>
          <UserAvatar avatarUrl={user.avatarUrl} size={40} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {/* Zobrazeni username ve stylu labelu */}
        <DropdownMenuLabel>@{user.username}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Odkaz na profil */}
        <Link href={`/users/${user.username}`}>
          <DropdownMenuItem>
            <UserIcon className="mr-2 size-4" />
            Profile
          </DropdownMenuItem>
        </Link>

        {/* Submenu pro vyber tematu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Monitor className="mr-2 size-4" />
            Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="mr-2 size-4" />
                System Default
                {theme === "system" && <Check className="ms-2 size-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 size-4" />
                Light
                {theme === "light" && <Check className="ms-2 size-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 size-4" />
                Dark
                {theme === "dark" && <Check className="ms-2 size-4" />}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Tlacitko pro odhlaseni */}
        <DropdownMenuItem
          onClick={() => {
            queryClient.clear(); // Vycisti React Query cache pred odhlasenim
            logout(); // Server action pro odhlaseni
          }}
        >
          <LogOutIcon className="mr-2 size-4" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
