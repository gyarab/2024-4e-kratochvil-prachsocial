import { useEffect, useState } from "react";
import { useSession } from "../SessionProvider";
import { StreamChat } from "stream-chat";
import kyInstance from "@/lib/ky";
import { error } from "console";

/**
 * Hook pro inicializaci Stream Chat klienta
 * Automaticky se pripoji k Stream API a vrati instanci klienta
 * @returns {StreamChat|null} - Instance chat klienta nebo null behem inicializace
 */
export default function useInitializeChatClient() {
  const { user } = useSession();
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);

  useEffect(() => {
    // Ziskame instanci StreamChat klienta
    const client = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_KEY!);

    // Pripojime uzivatele pomoci tokenu z API
    client
      .connectUser(
        {
          id: user.id,
          username: user.username,
          name: user.displayName,
          image: user.avatarUrl,
        },
        async () =>
          kyInstance
            .get(`/api/get-token`)
            .json<{ token: string }>()
            .then((data) => data.token),
      )
      .catch((error) => console.error(error))
      .then(() => setChatClient(client));

    // Cleanup pri unmount - odpojeni uzivatele
    return () => {
      setChatClient(null);
      client
        .disconnectUser()
        .catch((error) => console.error(error))
        .then(() => console.log("Disconnected"));
    };
  }, [user.id, user.username, user.displayName, user.avatarUrl]);

  return chatClient;
}
