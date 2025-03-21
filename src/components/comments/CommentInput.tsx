import { PostData } from "@/lib/types";
import { useState } from "react";
import { useSubmitCommentMutation } from "./mutations";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2, SendHorizonal } from "lucide-react";

interface CommentInputProps {
  post: PostData;
}

/**
 * Komponenta pro vstupni pole na zadani komentare
 * Obsahuje formular s textovym polem a tlacitkem pro odeslani
 */
export default function CommentInput({ post }: CommentInputProps) {
  // State pro obsah vstupniho pole
  const [input, setInput] = useState("");

  // Hook pro zpracovani odeslani komentare na server
  const mutation = useSubmitCommentMutation(post.id);

  /**
   * Zpracovani odeslani formulare
   * Odesle komentar a po uspesnem odeslani vymaze vstupni pole
   */
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!input) return;

    mutation.mutate(
      {
        post,
        content: input,
      },
      {
        onSuccess: () => setInput(""), // Vycisteni pole po uspesnem odeslani
      },
    );
  }

  return (
    <form className="flex w-full items-center gap-2" onSubmit={onSubmit}>
      <Input
        placeholder="Write a comment..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        autoFocus
      />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        disabled={!input.trim() || mutation.isPending} // Zakaze tlacitko pri prazdnem vstupu nebo behem odesilani
      >
        {!mutation.isPending ? (
          <SendHorizonal />
        ) : (
          <Loader2 className="animate-spin" />
        )}
      </Button>
    </form>
  );
}
