import kyInstance from "@/lib/ky";
import { FollowerInfo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook pro ziskani informaci o sledovacich konkretniho uzivatele
 *
 * @param userId - ID uzivatele, jehoz followers informace chceme nacist
 * @param initialState - Vychozi data pro followers, nez dojde k nacteni z API
 * @returns Query objekt s informacemi o followerech (pocet a jestli prihlaseny uzivatel sleduje daneho uzivatele)
 */

export default function useFollowerInfo(
  userId: string,
  initialState: FollowerInfo,
) {
  const query = useQuery({
    queryKey: ["folower-info", userId],
    queryFn: () =>
      kyInstance.get(`/api/users/${userId}/followers`).json<FollowerInfo>(),
    initialData: initialState,
    staleTime: Infinity, // Neaktualizujeme data automaticky
  });

  return query;
}
