"use client";
import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import Post from "@/components/posts/Post";
import PostsLoadingSkeleton from "@/components/posts/PostsLoadingSkeleton";
import kyInstance from "@/lib/ky";
import { PostsPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface SearchResultsProps {
  query: string;
}

// Komponenta pro zobrazeni vysledku vyhledavani
// Pouziva nekonecny scroll pro nacteni dalsich vysledku
export default function SearchResults({ query }: SearchResultsProps) {
  // Nastaveni infinite query pro vyhledavani prispevku
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["post-feed", "search", query],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get("/api/search", {
          searchParams: {
            q: query,
            ...(pageParam ? { cursor: pageParam } : {}),
          },
        })
        .json<PostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    gcTime: 0, // Vypnuti cache (vzdy ziskat fresh data pri zmene query)
  });

  // Ziskani vsech prispevku ze vsech nactenych stranek
  const posts = data?.pages.flatMap((page) => page.posts) || [];

  // Zobrazeni skeletonu behem nacitani
  if (status === "pending") {
    return <PostsLoadingSkeleton />;
  }

  // Zobrazeni zpravy, pokud nebyly nalezeny zadne prispevky
  if (status === "success" && !posts.length && !hasNextPage) {
    return (
      <p className="text-center text-muted-foreground">
        No posts found for this query. Try searching for something else.
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
