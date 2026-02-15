"use client";

export function MerchantKycBanner({ showBlockedMessage = false }: { showBlockedMessage?: boolean }) {
  return (
    <div className="border-0 bg-[#5e1914] px-6 py-4 text-center text-sm font-medium text-white font-sans">
      Account Pending Approval. Please allow 24–48 hours for KYC verification.
      {showBlockedMessage && (
        <span className="ml-2 opacity-90">
          You cannot book shipments until your account is approved.
        </span>
      )}
    </div>
  );
}
