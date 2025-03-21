"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { UserData } from "@/lib/types";
import EditProfileDialog from "./EditProfileDialog";

interface EditProfileButtonProps {
  user: UserData;
}

// Komponenta pro zobrazeni tlacitka upravy profilu a dialogu pro upravu
export default function EditProfileButton({ user }: EditProfileButtonProps) {
  // State pro zobrazeni/skryti dialogu
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setShowDialog(true)}>
        Edit Profile
      </Button>
      <EditProfileDialog
        user={user}
        open={showDialog}
        onOpenChange={setShowDialog}
      />
    </>
  );
}
