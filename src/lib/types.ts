import { Prisma } from "@prisma/client";

/**
 * Helper funkce pro vytvoreni select objektu pro data uzivatele
 *
 * @param loggedInUserId - ID prihlaseneho uzivatele pro kontrolu vztahu sledovani
 * @returns Prisma select objekt pro data uzivatele
 */
export function getUserDataSelect(loggedInUserId: string) {
  return {
    id: true,
    username: true,
    displayName: true,
    avatarUrl: true,
    bio: true,
    createdAt: true,
    // Kontrola, zda prihlaseny uzivatel sleduje daneho uzivatele
    followers: {
      where: {
        followerId: loggedInUserId,
      },
      select: {
        followerId: true,
      },
    },
    // Agregacni data
    _count: {
      select: {
        posts: true,
        followers: true,
      },
    },
  } satisfies Prisma.UserSelect;
}

// Typovy alias pro data uzivatele
export type UserData = Prisma.UserGetPayload<{
  select: ReturnType<typeof getUserDataSelect>;
}>;

/**
 * Helper funkce pro vytvoreni include objektu pro nacteni prispevku
 * s relevatnimi vztahy a daty
 *
 * @param loggedInUserId - ID prihlaseneho uzivatele
 */
export function getPostDataInclude(loggedInUserId: string) {
  return {
    // Data autora prispevku
    user: {
      select: getUserDataSelect(loggedInUserId),
    },
    // Prilohy prispevku (obrazky, videa)
    attachments: true,
    // Kontrola, zda prihlaseny uzivatel likoval prispevek
    likes: {
      where: {
        userId: loggedInUserId,
      },
      select: {
        userId: true,
      },
    },
    // Kontrola, zda si prihlaseny uzivatel ulozil prispevek
    saved_posts: {
      where: {
        userId: loggedInUserId,
      },
      select: {
        userId: true,
      },
    },
    // Pocty
    _count: {
      select: {
        likes: true,
        comments: true,
      },
    },
  } satisfies Prisma.PostInclude;
}

// Typovy alias pro data prispevku
export type PostData = Prisma.PostGetPayload<{
  include: ReturnType<typeof getPostDataInclude>;
}>;

// Rozhrani pro strankovani prispevku
export interface PostsPage {
  posts: PostData[];
  nextCursor: string | null;
}

/**
 * Helper funkce pro vytvoreni include objektu pro komentare
 */
export function getCommentDataInclude(loggedInUserId: string) {
  return {
    user: {
      select: getUserDataSelect(loggedInUserId),
    },
  } satisfies Prisma.CommentInclude;
}

// Typovy alias pro data komentare
export type CommentData = Prisma.CommentGetPayload<{
  include: ReturnType<typeof getCommentDataInclude>;
}>;

// Rozhrani pro strankovani komentaru
export interface CommentsPage {
  comments: CommentData[];
  previousCursor: string | null;
}

// Include objekt pro notifikace
export const notificationsInclude = {
  issuer: {
    select: {
      username: true,
      displayName: true,
      avatarUrl: true,
    },
  },
  post: {
    select: {
      content: true,
    },
  },
} satisfies Prisma.NotificationInclude;

// Typovy alias pro data notifikace
export type NotificationData = Prisma.NotificationGetPayload<{
  include: typeof notificationsInclude;
}>;

// Rozhrani pro strankovani notifikaci
export interface NotificationsPage {
  notifications: NotificationData[];
  nextCursor: string | null;
}

// Rozhranni pro informace o sledovacich uzivatele
export interface FollowerInfo {
  followers: number;
  isFollowedByUser: boolean;
}

// Rozhrani pro informace o likes prispevku
export interface LikeInfo {
  likes: number;
  isLikedByUser: boolean;
}

// Rozhrani pro informace o ulozeni prispevku
export interface SavedInfo {
  isSavedByUser: boolean;
}

// Rozhrani pro informace o poctu neprectenych notifikaci
export interface NotificationCountInfo {
  unreadCount: number;
}

// Rozhrani pro informace o poctu neprectenych zprav
export interface MessageCountInfo {
  unreadCount: number;
}
