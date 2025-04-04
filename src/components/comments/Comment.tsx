import { CommentData } from "@/lib/types";
import UserTooltip from "../UserTooltip";
import Link from "next/link";
import UserAvatar from "../UserAvatar";
import { formatRelativeDate } from "@/lib/utils";
import { useSession } from "@/app/(main)/SessionProvider";
import CommentMoreButton from "./CommentMoreButton";

interface CommentProps {
  comment: CommentData;
}

/**
 * Komponenta pro zobrazeni jednoho komentare
 * Zobrazuje avatar uzivatele, jmeno, cas a obsah komentare
 * Pro vlastni komentare zobrazuje tlacitko pro smazani
 */
export default function Comment({ comment }: CommentProps) {
  // Ziskani dat prihlaseneho uzivatele pro kontrolu, zda je autorem
  const { user } = useSession();

  return (
    <div className="group/comment flex gap-3 py-3">
      {/* Avatar uzivatele - skryty na malych obrazovkach */}
      <span className="hidden sm:inline">
        <UserTooltip user={comment.user}>
          <Link href={`/users/${comment.user.username}`}>
            <UserAvatar avatarUrl={comment.user.avatarUrl} size={40} />
          </Link>
        </UserTooltip>
      </span>

      {/* Hlavni obsah komentare */}
      <div>
        {/* Jmeno uzivatele a cas komentare */}
        <div className="flex items-center gap-1 text-sm">
          <UserTooltip user={comment.user}>
            <Link
              href={`/users/${comment.user.username}`}
              className="font-medium hover:underline"
            >
              {comment.user.displayName}
            </Link>
          </UserTooltip>
          <span className="text-muted-foreground">
            {formatRelativeDate(comment.createdAt)}
          </span>
        </div>

        {/* Text komentare */}
        <div>{comment.content}</div>
      </div>

      {/* Tlacitko pro smazani - zobrazuje se jen pro vlastni komentare */}
      {comment.user.id === user?.id && (
        <CommentMoreButton
          comment={comment}
          className="ms-auto opacity-0 transition-opacity group-hover/comment:opacity-100"
        />
      )}
    </div>
  );
}
