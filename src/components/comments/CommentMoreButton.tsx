import { CommentData } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { MoreHorizontal, Trash2 } from "lucide-react";
import DeleteCommentDialog from "./DeleteCommentDialog";
import { useState } from "react";

interface CommentMoreButtonProps {
  comment: CommentData;
  className?: string;
}

/**
 * Tlacitko s rozbalovacim menu pro akce s komentarem
 * Obsahuje pouze moznost smazani komentare
 */
export default function CommentMoreButton({
  comment,
  className,
}: CommentMoreButtonProps) {
  // State pro zobrazeni/skryti dialogu pro smazani
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      {/* Dropdown menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className={className}>
            <MoreHorizontal className="size-5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
            <span className="flex items-center gap-3 text-destructive">
              <Trash2 className="size-4" />
              Delete
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog pro potvrzeni smazani komentare */}
      <DeleteCommentDialog
        comment={comment}
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      />
    </>
  );
}
