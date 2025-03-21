"use client";

import useFollowerInfo from "@/hooks/useFollowerInfo";
import { FollowerInfo } from "@/lib/types";
import { useToast } from "./ui/use-toast";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "./ui/button";
import kyInstance from "@/lib/ky";

interface FollowButtonProps {
  userId: string; // ID uzivatele, ktereho sledujeme/prestaneme sledovat
  initialState: FollowerInfo; // Pocatecni stav - sledujeme/nesledujeme a pocet sledujicich
}

export default function FollowButton({
  userId,
  initialState,
}: FollowButtonProps) {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  // Nacitame aktualni stav sledovani (pocet sledujicich a zda sledujeme)
  const { data } = useFollowerInfo(userId, initialState);

  // Klic pro tanstack query cache
  const queryKey: QueryKey = ["folower-info", userId];

  // Mutace pro sledovani/odsledovani uzivatele
  const { mutate } = useMutation({
    // Posleme POST nebo DELETE pozadavek podle aktualniho stavu
    mutationFn: () =>
      data.isFollowedByUser
        ? kyInstance.delete(`/api/users/${userId}/followers`)
        : kyInstance.post(`/api/users/${userId}/followers`),

    // Optimistic update - okamzite aktualizujeme UI pred dokoncenim requestu
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<FollowerInfo>(queryKey);

      // Aktualizujeme pocet sledujicich a stav tlacitka
      queryClient.setQueryData<FollowerInfo>(queryKey, () => ({
        followers:
          (previousState?.followers || 0) +
          (previousState?.isFollowedByUser ? -1 : 1),
        isFollowedByUser: !previousState?.isFollowedByUser,
      }));

      return { previousState };
    },

    // Pri chybe vratime puvodni stav a zobrazime chybovou hlasku
    onError(error, variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState);
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to follow user. Please try again.",
      });
    },
  });

  return (
    <Button
      // Meni vzhled tlacitka podle stavu sledovani
      variant={data.isFollowedByUser ? "secondary" : "default"}
      onClick={() => mutate()}
    >
      {data.isFollowedByUser ? "Unfollow" : "Follow"}
    </Button>
  );
}
