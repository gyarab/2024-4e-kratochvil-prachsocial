"use client";
import kyInstance from "@/lib/ky";
import { UserData } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { HTTPError } from "ky";
import Link from "next/link";
import { PropsWithChildren } from "react";
import UserTooltip from "./UserTooltip";

interface UserLinkWithTooltipProps extends PropsWithChildren {
  username: string; // Username uzivatele pro vytvoreni odkazu a nacteni dat
}

export default function UserLinkWithTooltip({
  children,
  username,
}: UserLinkWithTooltipProps) {
  // Nacitame data uzivatele pro tooltip
  const { data } = useQuery({
    queryKey: ["user-data", username],
    queryFn: () =>
      kyInstance.get(`/api/users/username/${username}`).json<UserData>(),
    retry(failureCount, error) {
      // Nepokousime se opakovat dotaz, pokud uzivatel neexistuje (404)
      if (error instanceof HTTPError && error.response.status === 404) {
        return false;
      }
      // Jinak zkusime max 3x
      return failureCount < 3;
    },
    staleTime: Infinity, // Neaktualizujeme data automaticky
  });

  // Pokud nemame data, zobrazime jen odkaz bez tooltipu
  if (!data) {
    return (
      <Link
        href={`/users/${username}`}
        className="text-primary hover:underline"
      >
        {children}
      </Link>
    );
  }

  // Pokud mame data, obalime odkaz tooltipem
  return (
    <UserTooltip user={data}>
      <Link
        href={`/users/${username}`}
        className="text-primary hover:underline"
      >
        {children}
      </Link>
    </UserTooltip>
  );
}
