import { useRef } from "react";
import { Cropper, ReactCropperElement } from "react-cropper";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import "cropperjs/dist/cropper.css";

// Typove definice props pro dialog na oriznutí obrazku
interface CropImageDialogProps {
  src: string; // URL obrazku k oriznutí
  cropAspectRation: number; // Pomer stran vysledneho obrazku (napr. 1 pro ctverec)
  onCropped: (blob: Blob | null) => void; // Callback kdyz je obrazek oriznuty
  onClose: () => void; // Callback pro zavreni dialogu
}

export default function CropImageDialog({
  src,
  cropAspectRation,
  onCropped,
  onClose,
}: CropImageDialogProps) {
  // Reference na Cropper komponentu pro pristup k metodam knihovny
  const cropperRef = useRef<ReactCropperElement>(null);

  // Funkce pro oriznutí obrazku a ziskani vysledku jako Blob
  function crop() {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;
    // Vytvorime webp blob a predame ho zpet pres callback
    cropper.getCroppedCanvas().toBlob((blob) => onCropped(blob), "image/webp");
    onClose();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>
        <Cropper
          src={src}
          aspectRatio={cropAspectRation}
          guides={false} // Bez vodicich car
          zoomable={false} // Zakazuje zoom pro jednodussi pouziti
          ref={cropperRef}
          className="mx-auto size-fit"
        />
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={crop}>Crop</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
