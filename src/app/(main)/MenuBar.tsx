import { validateRequest } from "@/auth";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { Bell, Bookmark, Home, Mail } from "lucide-react";
import Link from "next/link";
import NotificationsButton from "./NotificationsButton";
import MessagesButton from "./MessagesButton";
import streamServerClient from "@/lib/stream";

interface MenuBarProps {
  className?: string;
}

/**
 * Komponenta pro zobrazeni hlavniho menu aplikace
 * Nacita pocty neprectenenych notifikaci a zprav
 */
export default async function MenuBar({ className }: MenuBarProps) {
  // Kontrola prihlaseni uzivatele
  const { user } = await validateRequest();

  if (!user) return null;

  // Paralelni nacteni poctu neprectenych notifikaci a zprav
  const [unreadNotificationCount, unreadMessagesCount] = await Promise.all([
    // Pocet neprectenych notifikaci z databaze
    prisma.notification.count({
      where: {
        recipientId: user.id,
        read: false,
      },
    }),
    // Pocet neprectenych zprav ze Stream chatu
    (await streamServerClient.getUnreadCount(user.id)).total_unread_count,
  ]);

  return (
    <div className={className}>
      {/* Tlacitko pro domovskou stranku */}
      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3"
        title="Home"
        asChild
      >
        <Link href="/">
          <Home />
          <span className="hidden lg:inline">Home</span>
        </Link>
      </Button>

      {/* Tlacitko pro notifikace s poctem neprectenych */}
      <NotificationsButton
        initialState={{ unreadCount: unreadNotificationCount }}
      />

      {/* Tlacitko pro zpravy s poctem neprectenych */}
      <MessagesButton initialState={{ unreadCount: unreadMessagesCount }} />

      {/* Tlacitko pro ulozene prispevky */}
      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3"
        title="Saved"
        asChild
      >
        <Link href="/saved">
          <Bookmark />
          <span className="hidden lg:inline">Saved</span>
        </Link>
      </Button>
    </div>
  );
}
