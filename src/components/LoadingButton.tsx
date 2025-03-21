import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "./ui/button";
import { Loader2 } from "lucide-react";

interface LoadingButtonProps extends ButtonProps {
  loading: boolean; // Indikuje, ze tlacitko je v nacitacim stavu
}

export default function LoadingButton({
  loading,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      // Disable tlacitko pokud je ve stavu loading nebo uz bylo disabled
      disabled={loading || disabled}
      className={cn("flex items-center gap-2", className)}
      {...props}
    >
      {/* Zobrazi loading spinner, kdyz je tlacitko ve stavu loading */}
      {loading && <Loader2 className="size-5 animate-spin" />}
      {props.children}
    </Button>
  );
}
