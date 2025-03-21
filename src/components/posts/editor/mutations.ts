import { useToast } from "@/components/ui/use-toast";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { submitPost } from "./actions";
import { PostsPage } from "@/lib/types";
import { useSession } from "@/app/(main)/SessionProvider";

/**
 * Hook pro vytvoreni noveho prispevku a aktualizaci cache
 *
 * @returns Mutation objekt pro praci s vytvorenim postu
 */
export function useSubmitPostMutation() {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const { user } = useSession();

  const mutation = useMutation({
    mutationFn: submitPost,
    onSuccess: async (newPost) => {
      // Definice filtru pro aktualizaci cache - jen stranky "for-you" a profil aktualniho uzivatele
      const queryFilter = {
        queryKey: ["post-feed"],
        predicate(query) {
          return (
            query.queryKey.includes("for-you") ||
            (query.queryKey.includes("user-posts") &&
              query.queryKey.includes(user.id))
          );
        },
      } satisfies QueryFilters;

      // Zruseni probihajicich dotazu pro prevenci race conditions
      await queryClient.cancelQueries(queryFilter);

      // Optimisticka aktualizace - pridani noveho postu na zacatek feedu
      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          const firstPage = oldData?.pages[0];

          if (firstPage) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  posts: [newPost, ...firstPage.posts],
                  nextCursor: firstPage.nextCursor,
                },
                ...oldData.pages.slice(1),
              ],
            };
          }
        },
      );

      // Invalidace cache pro dalsi dotazy, ktere nejsou jeste nactene
      queryClient.invalidateQueries({
        queryKey: queryFilter.queryKey,
        predicate(query) {
          return queryFilter.predicate(query) && !query.state.data;
        },
      });

      // Notifikace uzivateli o uspesnem vytvoreni
      toast({
        description: "Your post has been submitted!",
      });
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "An error occured while submitting your post.",
      });
    },
  });

  return mutation;
}
