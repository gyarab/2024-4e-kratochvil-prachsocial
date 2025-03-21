import kyInstance from "@/lib/ky";
import { SavedInfo } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Bookmark } from "lucide-react";
import { useToast } from "../ui/use-toast";

interface SaveButtonProps {
  postId: string;
  initialState: SavedInfo;
}

/**
 * Komponenta pro tlacitko na ulozeni/zruseni ulozeni prispevku
 * @param postId - ID prispevku
 * @param initialState - Vychozi stav ulozeni
 */
export default function SaveButton({ postId, initialState }: SaveButtonProps) {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const queryKey: QueryKey = ["saved-info", postId];

  // Ziskej aktualni stav ulozeni prispevku
  const { data } = useQuery({
    queryKey,
    queryFn: () =>
      kyInstance.get(`/api/posts/${postId}/saved`).json<SavedInfo>(),
    initialData: initialState,
    staleTime: Infinity, // Stav se nemeni bez nasi akce
  });

  // Mutace pro prepinani stavu ulozeni
  const { mutate } = useMutation({
    mutationFn: () =>
      data.isSavedByUser
        ? kyInstance.delete(`/api/posts/${postId}/saved`) // Pokud je ulozeno, smaz
        : kyInstance.post(`/api/posts/${postId}/saved`), // Jinak uloz

    // Optimisticka aktualizace UI pred dokoncenim API pozadavku
    onMutate: async () => {
      toast({
        description: `Post ${data.isSavedByUser ? "un" : ""}saved`,
      });

      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<SavedInfo>(queryKey);

      // Predpokládej uspech a aktualizuj stav
      queryClient.setQueryData<SavedInfo>(queryKey, () => ({
        isSavedByUser: !previousState?.isSavedByUser,
      }));

      return { previousState };
    },

    // Zpracovani pripadu, kdy API vrati chybu
    onError(error, variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState); // Vrat puvodni stav
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to save post. Please try again.",
      });
    },
  });

  return (
    <button onClick={() => mutate()} className="flex items-center gap-2">
      <Bookmark
        className={cn(
          "size-5",
          data.isSavedByUser && "fill-primary text-primary", // Vyplni ikonu, kdyz je prispevek ulozen
        )}
      />
    </button>
  );
}
