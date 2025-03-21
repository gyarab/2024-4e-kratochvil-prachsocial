import React, { useState } from "react";
import { Input, InputProps } from "./ui/input";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

// Rozsireny Input komponent s moznosti prepnuti viditelnosti hesla
const PasswordInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    // State pro sledovani, zda je heslo zobrazeno jako text nebo skryto
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"} // Meni typ inputu podle stavu
          className={cn("pe-10", className)} // Pridava padding vpravo pro tlacitko
          ref={ref}
          {...props}
        />
        {/* Tlacitko pro prepnuti viditelnosti hesla */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          title={showPassword ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 transform text-muted-foreground"
        >
          {showPassword ? (
            <EyeOff className="size-5" />
          ) : (
            <Eye className="size-5" />
          )}
        </button>
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
