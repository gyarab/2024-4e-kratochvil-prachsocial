"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { PostData } from "@/lib/types";
import { cn, formatRelativeDate } from "@/lib/utils";
import Link from "next/link";
import Linkify from "../Linkify";
import UserAvatar from "../UserAvatar";
import UserTooltip from "../UserTooltip";
import PostMoreButton from "./PostMoreButton";
import { Media } from "@prisma/client";
import Image from "next/image";
import LikeButton from "./LikeButton";
import SaveButton from "./SaveButton";
import { useState } from "react";
import { MessageSquare } from "lucide-react";
import Comments from "../comments/Comments";

/**
 * Props pro komponentu prispevku
 */
interface PostProps {
  post: PostData;
}

/**
 * Hlavni komponenta pro zobrazeni jednoho prispevku
 * Obsahuje hlavicku s autorem, text, media a tlacitka
 */
export default function Post({ post }: PostProps) {
  const { user } = useSession();

  const [showComments, setShowComments] = useState(false);

  return (
    <article className="group/post space-y-3 rounded-2xl bg-card p-5 shadow-sm">
      {/* Hlavicka prispevku s autorem a casem */}
      <div className="flex justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <UserTooltip user={post.user}>
            <Link href={`/users/${post.user.username}`}>
              <UserAvatar avatarUrl={post.user.avatarUrl} />
            </Link>
          </UserTooltip>
          <div>
            <UserTooltip user={post.user}>
              <Link
                href={`/users/${post.user.username}`}
                className="block font-medium hover:underline"
              >
                {post.user.displayName}
              </Link>
            </UserTooltip>
            <Link
              href={`/posts/${post.id}`}
              className="block text-sm text-muted-foreground hover:underline"
              suppressHydrationWarning
            >
              {formatRelativeDate(post.createdAt)}
            </Link>
          </div>
        </div>

        {/* Tlacitko pro smazani - jen pro vlastni prispevky */}
        {post.user.id === user.id && (
          <PostMoreButton
            post={post}
            className="opacity-0 transition-opacity group-hover/post:opacity-100"
          />
        )}
      </div>

      {/* Obsah prispevku s automatickym zpracovanim odkazu */}
      <Linkify>
        <div className="whitespace-pre-line break-words">{post.content}</div>
      </Linkify>

      {/* Media prispevku (obrazky, videa) */}
      {!!post.attachments.length && (
        <MediaPreviews attachments={post.attachments} />
      )}
      <hr className="text-muted-foreground" />

      {/* Tlacitka pro interakci (like, komentar, ulozeni) */}
      <div className="flex justify-between gap-5">
        <div className="flex items-center gap-5">
          <LikeButton
            postId={post.id}
            initialState={{
              likes: post._count.likes,
              isLikedByUser: post.likes.some((like) => like.userId === user.id),
            }}
          />
          <CommentButton
            post={post}
            onClick={() => setShowComments(!showComments)}
          />
        </div>
        <SaveButton
          postId={post.id}
          initialState={{
            isSavedByUser: post.saved_posts.some(
              (save) => save.userId === user.id,
            ),
          }}
        />
      </div>

      {/* Komentare - zobrazuji se az po kliknuti */}
      {showComments && <Comments post={post} />}
    </article>
  );
}

/**
 * Komponenta pro zobrazeni kolekce priloh
 */
interface MediaPreviewsProps {
  attachments: Media[];
}

function MediaPreviews({ attachments }: MediaPreviewsProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        attachments.length > 1 && "sm:grid sm:grid-cols-2", // Grid layout na vetsich obrazovkach
      )}
    >
      {attachments.map((m) => (
        <MediaPreview key={m.id} media={m} />
      ))}
    </div>
  );
}

/**
 * Komponenta pro zobrazeni jedne prilohy (obraz/video)
 */
interface MediaPreviewProps {
  media: Media;
}

function MediaPreview({ media }: MediaPreviewProps) {
  // Zobrazeni obrazku
  if (media.type === "IMAGE") {
    return (
      <Image
        src={media.url}
        alt="Attachment"
        width={500}
        height={500}
        className="mx-auto size-fit max-h-[30rem] rounded-2xl"
      />
    );
  }

  // Zobrazeni videa
  if (media.type === "VIDEO") {
    return (
      <div>
        <video
          src={media.url}
          controls
          className="mx-auto size-fit max-h-[30rem] rounded-2xl"
        />
      </div>
    );
  }

  // Fallback pro nepodporovane typy
  return <p className="text-destructive">Media type not supported</p>;
}

/**
 * Tlacitko pro zobrazeni komentaru
 */
interface CommentButtonProps {
  post: PostData;
  onClick: () => void;
}

function CommentButton({ post, onClick }: CommentButtonProps) {
  return (
    <button onClick={onClick} className="flex items-center gap-2">
      <MessageSquare className="size-5" />
      <span className="text-sm font-medium tabular-nums">
        {post._count.comments}{" "}
        <span className="hidden sm:inline">comments</span>
      </span>
    </button>
  );
}
