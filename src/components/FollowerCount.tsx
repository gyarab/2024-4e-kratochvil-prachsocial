"use client";

import useFollowerInfo from "@/hooks/useFollowerInfo";
import { FollowerInfo } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

interface FollowerCountProps {
  userId: string; // ID uzivatele, jehoz pocet sledujicich zobrazujeme
  initialState: FollowerInfo; // Pocatecni data o sledujicich
}

export default function FollowerCount({
  userId,
  initialState,
}: FollowerCountProps) {
  // Ziskame aktualni pocet sledujicich
  const { data } = useFollowerInfo(userId, initialState);

  return (
    <span>
      Followers: {/* Naformatovany pocet sledujicich (napr. 1.2k misto 1200) */}
      <span className="font-semibold">{formatNumber(data.followers)}</span>
    </span>
  );
}
