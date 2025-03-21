"use client";

import { Loader2 } from "lucide-react";
import useInitializeChatClient from "./useInitializeChatClient";
import { Chat as StreamChat } from "stream-chat-react";
import ChatSidebar from "./ChatSidebar";
import ChatChannel from "./ChatChannel";
import { useTheme } from "next-themes";
import { useState } from "react";

// Hlavni komponenta pro chat
export default function Chat() {
  const chatClient = useInitializeChatClient();

  const { resolvedTheme } = useTheme();
  const [sidebarOpen, setSidebarOen] = useState(false); // State pro mobilni zobrazeni

  // Zobrazi loader dokud se chat klient nenacte
  if (!chatClient) {
    return <Loader2 className="mx-auto my-3 animate-spin" />;
  }

  return (
    <main className="relative w-full overflow-hidden rounded-2xl bg-card shadow-sm">
      <div className="absolute bottom-0 top-0 flex w-full">
        <StreamChat
          client={chatClient}
          theme={
            resolvedTheme === "dark"
              ? "str-chat__theme-dark"
              : "str-chat__theme-light"
          }
        >
          <ChatSidebar
            open={sidebarOpen}
            onClose={() => setSidebarOen(false)}
          />
          <ChatChannel
            open={!sidebarOpen}
            openSideBar={() => setSidebarOen(true)}
          />
        </StreamChat>
      </div>
    </main>
  );
}
