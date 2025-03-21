import { useToast } from "@/components/ui/use-toast";
import { useUploadThing } from "@/lib/uploadthing";
import { UpdateUserProfileValues } from "@/lib/validation";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { updateUserProfile } from "./actions";
import { PostsPage } from "@/lib/types";

/**
 * Custom hook pro aktualizaci profilu uzivatele
 * Resi nahrani avataru i aktualizaci dat profilu
 * Aktualizuje cache se vsemi prispevky uzivatele
 */
export function useUpdateProfileMutation() {
  const { toast } = useToast();

  const router = useRouter();

  const queryClient = useQueryClient();

  // Hook pro nahrani avataru na uploadthing
  const { startUpload: startAvatarUpload } = useUploadThing("avatar");

  const mutation = useMutation({
    // Paralelne nahrajeme profil i avatar (pokud byl zmenen)
    mutationFn: async ({
      values,
      avatar,
    }: {
      values: UpdateUserProfileValues;
      avatar?: File;
    }) => {
      return Promise.all([
        updateUserProfile(values),
        avatar && startAvatarUpload([avatar]),
      ]);
    },

    onSuccess: async ([updatedUser, uploadResult]) => {
      // Ziskame URL noveho avataru (pokud byl nahran)
      const newAvatarUrl = uploadResult?.[0].serverData.avatarUrl;

      // Najdeme cache s prispevky
      const queryFilter: QueryFilters = {
        queryKey: ["post-feed"],
      };

      // Zrusime probihajici dotazy
      await queryClient.cancelQueries(queryFilter);

      // Aktualizujeme cache s prispevky - aktualizujeme uzivatele na vsech prispevich
      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              posts: page.posts.map((post) => {
                // Aktualizujeme uzivatele jen u jeho prispevku
                if (post.user.id === updatedUser.id) {
                  return {
                    ...post,
                    user: {
                      ...updatedUser,
                      avatarUrl: newAvatarUrl || updatedUser.avatarUrl,
                    },
                  };
                }
                return post;
              }),
            })),
          };
        },
      );

      // Aktualizujeme stranku a zobrazime uspech
      router.refresh();

      toast({
        description: "Profile updated!",
      });
    },

    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description:
          "An error occured while updating your profile. Please try again.",
      });
    },
  });

  return mutation;
}
