import { useToast } from "@/components/ui/use-toast";
import { useUploadThing } from "@/lib/uploadthing";
import { useState } from "react";

// Definice struktury prilohy
export interface Attachment {
  file: File;
  mediaId?: string; // ID nahrane prilohy v DB, none pokud se jeste nahrava
  isUploading: boolean;
}

/**
 * Hook pro spravu nahravani medii k prispevkum
 *
 * @returns Metody a stav pro praci s nahravanymi soubory
 */
export default function useMediaUpload() {
  const { toast } = useToast();

  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const [uploadProgress, setUploadProgress] = useState<number>();

  // Inicializace UploadThing hooku
  const { startUpload, isUploading } = useUploadThing("attachment", {
    // Pred zahajenim nahravani prejmenovani souboru pro lepsi organizaci
    onBeforeUploadBegin(files) {
      const renamedFiles = files.map((file) => {
        const extension = file.name.split(".").pop();
        return new File(
          [file],
          `attachment_${crypto.randomUUID()}.${extension}`,
          {
            type: file.type,
          },
        );
      });

      // Pridani souboru do lokalniho stavu
      setAttachments((prev) => [
        ...prev,
        ...renamedFiles.map((file) => ({ file, isUploading: true })),
      ]);

      return renamedFiles;
    },
    // Sledovani prubehu nahravani
    onUploadProgress: setUploadProgress,
    // Po dokonceni nahravani aktualizace lokalniho stavu s ID z backendu
    onClientUploadComplete(res) {
      setAttachments((prev) =>
        prev.map((a) => {
          const uploadResult = res.find((r) => r.name === a.file.name);
          if (!uploadResult) return a;
          return {
            ...a,
            mediaId: uploadResult.serverData.mediaId,
            isUploading: false,
          };
        }),
      );
    },
    // Osetreni chyb pri nahravani
    onUploadError(e) {
      setAttachments((prev) => prev.filter((a) => !a.isUploading));
      toast({
        variant: "destructive",
        description: "There was an error uploading your file. Please try again.",
      });
    },
  });

  // Wrapper nad startUpload s validaci
  function handleStartUpload(files: File[]) {
    // Prevence vicenasobneho nahravani
    if (isUploading) {
      toast({
        variant: "destructive",
        description: "Please wait for the current file to finish uploading.",
      });
      return;
    }

    // Kontrola maximalniho poctu priloh
    if (attachments.length + files.length > 5) {
      toast({
        variant: "destructive",
        description: "You can only upload up to 5 files per post.",
      });
      return;
    }

    startUpload(files);
  }

  // Odstraneni prilohy z lokalniho stavu
  function removeAttachment(fileName: string) {
    setAttachments((prev) => prev.filter((a) => a.file.name !== fileName));
  }

  // Reset stavu pro novy prispevek
  function reset() {
    setAttachments([]);
    setUploadProgress(undefined);
  }

  return {
    startUpload: handleStartUpload,
    attachments,
    isUploading,
    uploadProgress,
    removeAttachment,
    reset,
  };
}
