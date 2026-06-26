"use client";

import { useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { toggleAdvertisementStatus } from "@/lib/actions/advertisement.actions";

export function ToggleAdvertisementStatus({ id, isActive }: { id: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = (checked: boolean) => {
    startTransition(async () => {
      const result = await toggleAdvertisementStatus(id, checked);
      if (!result.success) {
        alert(result.error);
      }
    });
  };

  return (
    <Switch 
      checked={isActive} 
      onCheckedChange={handleToggle} 
      disabled={isPending} 
    />
  );
}
