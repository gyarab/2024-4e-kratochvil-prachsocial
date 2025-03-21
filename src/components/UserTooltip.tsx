"use client";
import { useSession } from "@/app/(main)/SessionProvider";
import { FollowerInfo, UserData } from "@/lib/types";
import Link from "next/link";
import { PropsWithChildren } from "react";
import FollowButton from "./FollowButton";
import FollowerCount from "./FollowerCount";
import Linkify from "./Linkify";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import UserAvatar from "./UserAvatar";

interface UserTooltipProps extends PropsWithChildren {
  user: UserData; // Data uzivatele pro zobrazeni v tooltipu
}

export default function UserTooltip({ children, user }: UserTooltipProps) {
  // Ziskame data prihlaseneho uzivatele
  const { user: loggedInUser } = useSession();

  // Vytvorime stav pro Follow button a FollowerCount
  const followerState: FollowerInfo = {
    followers: user._count.followers,
    isFollowedByUser: !!user.followers.some(
      ({ followerId }) => followerId === loggedInUser.id, // Kontrola, zda uzivatel sleduje profil
    ),
  };

  return (
    <TooltipProvider>
      <Tooltip>
        {/* Obsah, na kterem se pri najeti mysi zobrazi tooltip */}
        <TooltipTrigger asChild>{children}</TooltipTrigger>

        {/* Samotny obsah tooltipu */}
        <TooltipContent>
          <div className="flex max-w-80 flex-col gap-3 break-words px-1 py-2.5 md:min-w-52">
            {/* Hlavicka s avatarem a follow tlacitkem */}
            <div className="flex items-center justify-between gap-2">
              <Link href={`/users/${user.username}`}>
                <UserAvatar size={70} avatarUrl={user.avatarUrl} />
              </Link>
              {/* Follow tlacitko se nezobrazuje pro vlastni profil */}
              {loggedInUser.id !== user.id && (
                <FollowButton userId={user.id} initialState={followerState} />
              )}
            </div>

            {/* Informace o uzivateli */}
            <div>
              <Link href={`/users/${user.username}`}>
                <div className="text-lg font-semibold hover:underline">
                  {user.displayName}
                </div>
                <div className="text-muted-foreground">@{user.username}</div>
              </Link>
            </div>

            {/* Bio uzivatele (pokud existuje) */}
            {user.bio && (
              <Linkify>
                <div className="line-clamp-4 whitespace-pre-line">
                  {user.bio}
                </div>
              </Linkify>
            )}

            {/* Pocet sledujicich */}
            <FollowerCount userId={user.id} initialState={followerState} />
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
