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

export default function SaveButton({ postId, initialState }: SaveButtonProps) {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const queryKey: QueryKey = ["saved-info", postId];

  const { data } = useQuery({
    queryKey,
    queryFn: () =>
      kyInstance.get(`/api/posts/${postId}/saved`).json<SavedInfo>(),
    initialData: initialState,
    staleTime: Infinity,
  });

  const { mutate } = useMutation({
    mutationFn: () =>
      data.isSavedByUser
        ? kyInstance.delete(`/api/posts/${postId}/saved`)
        : kyInstance.post(`/api/posts/${postId}/saved`),
    onMutate: async () => {
      toast({
        description: `Post ${data.isSavedByUser ? "un" : ""}saved`,
      });

      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<SavedInfo>(queryKey);

      queryClient.setQueryData<SavedInfo>(queryKey, () => ({
        isSavedByUser: !previousState?.isSavedByUser,
      }));

      return { previousState };
    },
    onError(error, variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState);
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
          data.isSavedByUser && "fill-primary text-primary",
        )}
      />
    </button>
  );
}
