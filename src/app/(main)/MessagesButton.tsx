"use client";

import { Button } from "@/components/ui/button";
import kyInstance from "@/lib/ky";
import { MessageCountInfo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import Link from "next/link";

interface MessagesButtonProps {
  initialState: MessageCountInfo;
}

/**
 * Tlacitko pro pristup ke zpravam, zobrazuje pocet neprectenych zprav
 * Automaticky aktualizuje pocet neprectenych zprav kazdou minutu
 */
export default function MessagesButton({ initialState }: MessagesButtonProps) {
  // Pouziti React Query pro periodickou aktualizaci poctu neprectenych zprav
  const { data } = useQuery({
    queryKey: ["unread-messages-count"],
    queryFn: () =>
      kyInstance.get("/api/messages/unread-count").json<MessageCountInfo>(),
    initialData: initialState,
    refetchInterval: 60 * 1000, // Aktualizace kazdou minutu
  });

  return (
    <Button
      variant="ghost"
      className="flex items-center justify-start gap-3"
      title="Messages"
      asChild
    >
      <Link href="/messages">
        <div className="relative">
          <Mail />
          {/* Badge s poctem neprectenych zprav - zobrazi se jen kdyz existuji neprectene */}
          {!!data.unreadCount && (
            <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1 text-xs font-medium tabular-nums text-primary-foreground">
              {data.unreadCount}
            </span>
          )}
        </div>
        <span className="hidden lg:inline">Messages</span>
      </Link>
    </Button>
  );
}