import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import {
  Channel,
  ChannelHeader,
  ChannelHeaderProps,
  MessageInput,
  MessageList,
  Window,
} from "stream-chat-react";

interface ChatChannelProps {
  open: boolean;
  openSideBar: () => void;
}

// Komponenta zobrazujici aktivni chat kanal
export default function ChatChannel({ open, openSideBar }: ChatChannelProps) {
  return (
    <div className={cn("w-full md:block", !open && "hidden")}>
      <Channel>
        <Window>
          <CustomChannelHeader openSideBar={openSideBar} />
          <MessageList />
          <MessageInput />
        </Window>
      </Channel>
    </div>
  );
}

// Rozsirujeme standardni props o moznost otevreni sidebaru
interface CustomChannelHeaderProps extends ChannelHeaderProps {
  openSideBar: () => void;
}

// Vlastni header pro chat, pridava tlacitko pro mobilni zobrazeni
function CustomChannelHeader({
  openSideBar,
  ...props
}: CustomChannelHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-full p-2 md:hidden">
        <Button size="icon" variant="ghost" onClick={openSideBar}>
          <Menu className="size-5" />
        </Button>
      </div>
      <ChannelHeader {...props} />
    </div>
  );
}
