// https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries#what-if-i-want-to-show-the-pages-in-reversed-order

import { CommentsPage, PostData } from "@/lib/types";
import CommentInput from "./CommentInput";
import { useInfiniteQuery } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import Comment from "./Comment";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

interface CommentsProps {
  post: PostData;
}

/**
 * Komponenta pro zobrazeni komentaru k prispevku
 * Pouziva obracenou infinite query - nejstarsi komentare se nacitaji prvni
 */
export default function Comments({ post }: CommentsProps) {
  // Nacteni komentaru z API s paginaci
  const { data, fetchNextPage, hasNextPage, isFetching, status } =
    useInfiniteQuery({
      queryKey: ["comments", post.id],
      queryFn: ({ pageParam }) =>
        kyInstance
          .get(
            `/api/posts/${post.id}/comments`,
            pageParam ? { searchParams: { cursor: pageParam } } : {},
          )
          .json<CommentsPage>(),
      initialPageParam: null as string | null,
      getNextPageParam: (firstPage) => firstPage.previousCursor,
      // Obraceni poradi stranek - nejstarsi komentare prvni
      select: (data) => ({
        pages: [...data.pages].reverse(),
        pageParams: [...data.pageParams].reverse(),
      }),
    });

  // Extrakce vsech komentaru ze vsech stranek
  const comments = data?.pages.flatMap((page) => page.comments) || [];

  return (
    <div className="space-y-3">
      {/* Vstupni pole pro novy komentar */}
      <CommentInput post={post} />

      {/* Tlacitko pro nacteni dalsich komentaru - nahore, protoze nacitame starsi */}
      {hasNextPage && (
        <Button
          variant="link"
          className="mx-auto block"
          disabled={isFetching}
          onClick={() => fetchNextPage()}
        >
          Load more comments
        </Button>
      )}

      {/* Stavy nacitani a chyb */}
      {status === "pending" && <Loader2 className="mx-auto animate-spin" />}
      {status === "success" && !comments.length && (
        <p className="text-center text-muted-foreground">No comments yet! ):</p>
      )}
      {status === "error" && (
        <p className="text-center text-muted-foreground">
          An error occurred while loading comments.
        </p>
      )}

      {/* Seznam komentaru */}
      <div className="divide-y">
        {comments.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}
