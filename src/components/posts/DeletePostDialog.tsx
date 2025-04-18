import { PostData } from "@/lib/types";
import { useDeletePostMutation } from "./mutations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import LoadingButton from "../LoadingButton";
import { Button } from "../ui/button";

/**
 * Props pro dialog potvrzeni smazani prispevku
 */
interface DeletePostDialogProps {
  post: PostData; // Data prispevku, ktery bude smazan
  open: boolean; // Stav otevreni/zavreni dialogu
  onClose: () => void; // Callback pri zavreni dialogu
}

/**
 * Dialog pro potvrzeni smazani prispevku
 * Ukazuje potvrzovaci zpravu a tlacitka pro smazani/zruseni
 */
export default function DeletePostDialog({
  post,
  open,
  onClose,
}: DeletePostDialogProps) {
  const mutation = useDeletePostMutation();

  // Handler pro kontrolu zavreni dialogu
  function handleOpenChange(open: boolean) {
    // Zabraneni zavreni dialogu pokud probiha mazani
    if (!open || !mutation.isPending) {
      onClose();
    }
  }
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Post</DialogTitle>
          <DialogDescription>
            Are sure you want to delete this post? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <LoadingButton
            variant="destructive"
            onClick={() => mutation.mutate(post.id, { onSuccess: onClose })}
            loading={mutation.isPending}
          >
            Delete
          </LoadingButton>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
