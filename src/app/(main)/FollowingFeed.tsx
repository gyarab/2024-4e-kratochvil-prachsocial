"use client";

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import Post from "@/components/posts/Post";
import PostsLoadingSkeleton from "@/components/posts/PostsLoadingSkeleton";
import { Button } from "@/components/ui/button";
import kyInstance from "@/lib/ky";
import { PostData, PostsPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

/**
 * Komponenta zobrazujici feed prispevku od sledovanych uzivatelu
 * Pouziva nekonecny scroll pro nacitani dalsich prispevku
 */
export default function FollowingFeed() {
  // Nastaveni infinite query pro nacitani prispevku od sledovanych uzivatelu
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["post-feed", "following"],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          "/api/posts/following",
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

  // Zobrazeni zpravy, pokud uzivatel nikoho nesleduje nebo sledovani uzivatele nemaji prispevky
  if (status === "success" && !posts.length && !hasNextPage) {
    return (
      <p className="text-center text-muted-foreground">
        No posts here. Start following someone to see their posts here!
      </p>
    );
  }

  // Chybova zprava
  if (status === "error") {
    return (
      <p className="text-center text-destructive">
        An error occured while loading posts.
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
