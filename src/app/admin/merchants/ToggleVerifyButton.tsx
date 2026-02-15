"use client";

import { toggleMerchantVerification } from "./actions";
import { Button } from "@/components/ui/button";

export function ToggleVerifyButton({
  merchantId,
  isVerified,
}: {
  merchantId: string;
  isVerified: boolean;
}) {
  return (
    <form action={toggleMerchantVerification}>
      <input type="hidden" name="merchantId" value={merchantId} />
      <Button
        type="submit"
        variant={isVerified ? "outline" : "default"}
        size="sm"
        className={isVerified ? "border-amber-500 text-amber-700 hover:bg-amber-50" : ""}
      >
        {isVerified ? "Unverify" : "Verify"}
      </Button>
    </form>
  );
}
