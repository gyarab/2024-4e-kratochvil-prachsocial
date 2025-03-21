import { PostsPage } from "@/lib/types";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "../ui/use-toast";
import { deletePost } from "./actions";

/**
 * Hook pro smazani prispevku a aktualizaci UI
 *
 * @returns Mutation objekt pro smazani prispevku
 */
export function useDeletePostMutation() {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const router = useRouter();
  const pathname = usePathname();

  const mutation = useMutation({
    mutationFn: deletePost,
    onSuccess: async (deletedPost) => {
      // Filter pro aktualizaci vsech dotazu na feed prispevku
      const queryFilter: QueryFilters = { queryKey: ["post-feed"] };

      // Zruseni probihajicich dotazu
      await queryClient.cancelQueries(queryFilter);

      // Aktualizace cache - odstraneni smazaneho prispevku ze vsech stranek
      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              posts: page.posts.filter((p) => p.id !== deletedPost.id),
            })),
          };
        },
      );

      // Notifikace o uspesnem smazani
      toast({
        description: "Post deleted!",
      });

      // Presmerovani, pokud jsme byli na strance smazaneho prispevku
      if (pathname === `/posts/${deletedPost.id}`) {
        router.push(`/users/${deletedPost.user.username}`);
      }
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to delete post. Please try again.",
      });
    },
  });

  return mutation;
}
