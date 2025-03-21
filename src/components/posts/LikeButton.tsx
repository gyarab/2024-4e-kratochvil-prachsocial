import { LikeInfo } from "@/lib/types";
import { useToast } from "../ui/use-toast";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Props pro tlacitko like
 */
interface LikeButtonProps {
  postId: string; // ID prispevku pro like/unlike
  initialState: LikeInfo; // Vychozi stav (pocet likes, stav like od uzivatele)
}

/**
 * Tlacitko pro pridani/odebrani like u prispevku
 * Pouziva optimisticke UI pro okamzitou reakci
 */
export default function LikeButton({ postId, initialState }: LikeButtonProps) {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  // Klic pro React Query cache
  const queryKey: QueryKey = ["like-info", postId];

  // Nacteni aktualnich dat o like
  const { data } = useQuery({
    queryKey,
    queryFn: () =>
      kyInstance.get(`/api/posts/${postId}/likes`).json<LikeInfo>(),
    initialData: initialState,
    staleTime: Infinity, // Data se nepovazuji za zastarala - manualni invalidace
  });

  // Mutace pro like/unlike prispevku
  const { mutate } = useMutation({
    mutationFn: () =>
      data.isLikedByUser
        ? kyInstance.delete(`/api/posts/${postId}/likes`) // Unlike
        : kyInstance.post(`/api/posts/${postId}/likes`), // Like

    // Optimisticka aktualizace UI pred dokoncenim API pozadavku
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<LikeInfo>(queryKey);

      // Aktualizace cache - okamzite zmenit stav
      queryClient.setQueryData<LikeInfo>(queryKey, () => ({
        likes:
          (previousState?.likes || 0) + (previousState?.isLikedByUser ? -1 : 1),
        isLikedByUser: !previousState?.isLikedByUser,
      }));

      return { previousState }; // Pro pripadny rollback
    },

    // Obsluzna rutina pri chybe - vratit puvodni stav
    onError(error, variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState);
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to like post. Please try again.",
      });
    },
  });

  return (
    <button onClick={() => mutate()} className="flex items-center gap-2">
      <Heart
        className={cn(
          "size-5",
          data.isLikedByUser && "fill-red-500 text-red-500",
        )}
      />
      <span className="text-sm font-medium tabular-nums">
        {data.likes} <span className="hidden sm:inline">likes</span>
      </span>
    </button>
  );
}
