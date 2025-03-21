import { validateRequest } from "@/auth";
import FollowButton from "@/components/FollowButton";
import FollowerCount from "@/components/FollowerCount";
import TrendsSidebar from "@/components/TrendsSidebar";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";
import prisma from "@/lib/prisma";
import { FollowerInfo, getUserDataSelect, UserData } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { formatDate } from "date-fns";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import UserPosts from "./UserPosts";
import Linkify from "@/components/Linkify";
import EditProfileButton from "./EditProfileButton";

interface PageProps {
  params: { username: string };
}

/**
 * Ziskani dat uzivatele podle username, s cache
 * Pouziva insensitive vyhledavani, aby fungovalo nezavisle na velikosti pismen
 */
const getUser = cache(async (username: string, loggedInUserId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive", // Ignoruje velikost pismen
      },
    },
    select: getUserDataSelect(loggedInUserId),
  });

  if (!user) notFound();

  return user;
});

/**
 * Generovani metadat pro SEO a title stranky
 */
export async function generateMetadata({
  params: { username },
}: PageProps): Promise<Metadata> {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) return {};

  const user = await getUser(username, loggedInUser.id);

  return {
    title: `${user.displayName} (@${user.username})`,
  };
}

/**
 * Hlavni komponenta stranky profilu uzivatele
 * Zobrazuje profil a prispevky uzivatele
 */
export default async function Page({ params: { username } }: PageProps) {
  // Kontrola prihlaseni
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) {
    return (
      <p className="text-destructive">
        You must be logged in to view this page.
      </p>
    );
  }

  // Nacteni dat uzivatele podle username
  const user = await getUser(username, loggedInUser.id);

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <UserProfile user={user} loggedInUserId={loggedInUser.id} />
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h2 className="text-center text-2xl font-bold">
            {user.displayName}&apos;s posts
          </h2>
        </div>
        <UserPosts userId={user.id} />
      </div>
      <TrendsSidebar />
    </main>
  );
}

interface UserProfileProps {
  user: UserData;
  loggedInUserId: string;
}

/**
 * Komponenta pro zobrazeni informaci o uzivateli
 * Obsahuje avatar, jmeno, username, pocet sledujicich, tlacitko pro sledovani/upravu
 */
async function UserProfile({ user, loggedInUserId }: UserProfileProps) {
  // Priprava dat pro FollowButton a FollowerCount
  const followerInfo: FollowerInfo = {
    followers: user._count.followers,
    isFollowedByUser: user.followers.some(
      ({ followerId }) => followerId === loggedInUserId,
    ),
  };

  return (
    <div className="h-fit w-full space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      {/* Avatar uzivatele */}
      <UserAvatar
        avatarUrl={user.avatarUrl}
        size={250}
        className="mx-auto size-full max-h-60 max-w-60 rounded-full"
      />
      <div className="flex flex-wrap gap-3 sm:flex-nowrap">
        <div className="me-auto space-y-3">
          {/* Jmeno a username */}
          <div>
            <h1 className="text-3xl font-bold">{user.displayName}</h1>
            <div className="text-muted-foreground">@{user.username}</div>
          </div>
          {/* Datum registrace */}
          <div>
            <span className="text-muted-foreground">
              Member since {formatDate(user.createdAt, "d MMM, yyyy")}
            </span>
          </div>
          {/* Statistiky - pocet prispevku a sledujicich */}
          <div className="flex items-center gap-3">
            <span>
              Posts:{" "}
              <span className="font-semibold">
                {formatNumber(user._count.posts)}
              </span>
            </span>
            <FollowerCount userId={user.id} initialState={followerInfo} />
          </div>
        </div>

        {/* Tlacitko pro upravu profilu nebo pro sledovani */}
        {user.id === loggedInUserId ? (
          <EditProfileButton user={user} />
        ) : (
          <FollowButton userId={user.id} initialState={followerInfo} />
        )}
      </div>

      {/* Bio uzivatele - zobrazuje se jen pokud existuje */}
      {user.bio && (
        <>
          <hr />
          <Linkify>
            <div className="overflow-hidden whitespace-pre-line break-words">
              {user.bio}
            </div>
          </Linkify>
        </>
      )}
    </div>
  );
}
