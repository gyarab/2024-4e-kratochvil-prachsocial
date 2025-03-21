import { CommentData, CommentsPage } from "@/lib/types";
import {
  InfiniteData,
  QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useToast } from "../ui/use-toast";
import { deleteComment, submitComment } from "./actions";

/**
 * Hook pro pridani komentare
 * Zpracovava odeslani komentare na server a aktualizaci cache
 *
 * @param postId - ID prispevku ke kteremu se komentar pridava
 */
export function useSubmitCommentMutation(postId: string) {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: submitComment,
    onSuccess: async (newComment) => {
      // Query key pro komentare k prispevku
      const queryKey: QueryKey = ["comments", postId];

      // Zruseni probihajicich dotazu
      await queryClient.cancelQueries({ queryKey });

      // Aktualizace cache - pridani noveho komentare na konec prvni stranky
      queryClient.setQueryData<InfiniteData<CommentsPage, string | null>>(
        queryKey,
        (oldData) => {
          const firstPage = oldData?.pages[0];

          if (firstPage) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  previousCursor: firstPage.previousCursor,
                  comments: [...firstPage.comments, newComment],
                },
                ...oldData.pages.slice(1),
              ],
            };
          }
        },
      );

      // Invalidace cache jen pro prazdne dotazy (kdyz nejsou data v cache)
      queryClient.invalidateQueries({
        queryKey,
        predicate(query) {
          return !query.state.data;
        },
      });

      // Zobrazeni uspesne zpravy
      toast({
        description: "Comment submitted",
      });
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "An error occured while submitting your comment.",
      });
    },
  });

  return mutation;
}

/**
 * Hook pro smazani komentare
 * Zpracovava smazani komentare na serveru a aktualizaci cache
 */
export function useDeleteCommentMutation() {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: async (deletedComment) => {
      // Query key pro komentare k prispevku
      const queryKey: QueryKey = ["comments", deletedComment.postId];

      // Zruseni probihajicich dotazu
      await queryClient.cancelQueries({ queryKey });

      // Aktualizace cache - odstraneni komentare
      queryClient.setQueryData<InfiniteData<CommentsPage, string | null>>(
        queryKey,
        (oldData) => {
          if (!oldData) return;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              previousCursor: page.previousCursor,
              comments: page.comments.filter((c) => c.id !== deletedComment.id),
            })),
          };
        },
      );

      // Zobrazeni uspesne zpravy
      toast({
        description: "Comment deleted!",
      });
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to delete comment. Please try again.",
      });
    },
  });

  return mutation;
}
