"use client";

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import Post from "@/components/posts/Post";
import PostsLoadingSkeleton from "@/components/posts/PostsLoadingSkeleton";
import kyInstance from "@/lib/ky";
import { PostsPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface UserPostsProps {
  userId: string;
}

/**
 * Komponenta pro zobrazeni prispevku konkretniho uzivatele
 * Pouziva nekonecny scroll pro postupne nacitani dalsich prispevku
 */
export default function UserPosts({ userId }: UserPostsProps) {
  // Nastaveni infinite query pro nacitani prispevku uzivatele podle ID
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["post-feed", "user-posts", userId],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          `/api/users/${userId}/posts`,
          pageParam ? { searchParams: { cursor: pageParam } } : {},
        )
        .json<PostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  // Extrakce vsech prispevku ze vsech nactenych stranek
  const posts = data?.pages.flatMap((page) => page.posts) || [];

  // Zobrazeni loading stavu
  if (status === "pending") {
    return <PostsLoadingSkeleton />;
  }

  // Zobrazeni zpravy, pokud uzivatel nema zadne prispevky
  if (status === "success" && !posts.length && !hasNextPage) {
    return (
      <p className="text-center text-muted-foreground">
        This user has&apos;t posted anything yet! ):
      </p>
    );
  }

  // Chybova zprava
  if (status === "error") {
    return (
      <p className="text-center text-destructive">
        An error occurred while loading posts.
      </p>
    );
  }

  return (
    <InfiniteScrollContainer
      className="space-y-5"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
      {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
    </InfiniteScrollContainer>
  );
}