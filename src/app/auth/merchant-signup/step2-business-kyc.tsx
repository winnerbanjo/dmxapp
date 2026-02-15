"use client";

import { useState } from "react";
import type { BusinessKycData } from "./page";

const INPUT_CLASS =
  "mt-2 w-full rounded-none border border-zinc-200 bg-white px-4 py-3 font-sans text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]";
const LABEL_CLASS = "block text-xs font-medium uppercase tracking-wider text-zinc-500 font-sans";

export function MerchantSignupStep2({
  data,
  onChange,
  onBack,
  onSubmit,
}: {
  data: BusinessKycData;
  onChange: (d: BusinessKycData) => void;
  onBack: () => void;
  onSubmit: () => Promise<void>;
}) {
  const [submitting, setSubmitting] = useState(false);
  const valid = data.companyName.trim() && data.rcNumber.trim() && data.businessAddress.trim();

  return (
    <form
      className="mt-10 space-y-8"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!valid || submitting) return;
        setSubmitting(true);
        try {
          await onSubmit();
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <div>
        <label htmlFor="companyName" className={LABEL_CLASS}>
          Company Name
        </label>
        <input
          id="companyName"
          type="text"
          value={data.companyName}
          onChange={(e) => onChange({ ...data, companyName: e.target.value })}
          placeholder="Registered business name"
          className={INPUT_CLASS}
          required
        />
      </div>
      <div>
        <label htmlFor="rcNumber" className={LABEL_CLASS}>
          RC Number (CAC)
        </label>
        <input
          id="rcNumber"
          type="text"
          value={data.rcNumber}
          onChange={(e) => onChange({ ...data, rcNumber: e.target.value })}
          placeholder="e.g. RC 123456"
          className={INPUT_CLASS}
          required
        />
      </div>
      <div>
        <label htmlFor="businessAddress" className={LABEL_CLASS}>
          Business Address
        </label>
        <textarea
          id="businessAddress"
          value={data.businessAddress}
          onChange={(e) => onChange({ ...data, businessAddress: e.target.value })}
          placeholder="Full registered address"
          rows={3}
          className={INPUT_CLASS}
          required
        />
      </div>
      <div>
        <label className={LABEL_CLASS}>CAC Document Upload</label>
        <div className="mt-2 flex min-h-[120px] flex-col items-center justify-center rounded-none border-2 border-dashed border-zinc-200 bg-zinc-50 p-6">
          <input
            type="file"
            accept=".pdf,image/*"
            className="hidden"
            id="cac-doc"
            onChange={(e) => onChange({ ...data, cacDocumentFile: e.target.files?.[0] ?? null })}
          />
          <label htmlFor="cac-doc" className="cursor-pointer text-center text-sm text-zinc-500 font-sans">
            {data.cacDocumentFile ? data.cacDocumentFile.name : "Upload CAC certificate (PDF or image)"}
          </label>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-none border border-zinc-200 bg-white py-4 text-sm font-medium text-zinc-700 hover:bg-zinc-50 font-sans"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!valid || submitting}
          className="flex-1 rounded-none bg-[#5e1914] py-4 text-sm font-medium text-white hover:bg-[#4a130f] disabled:opacity-50 font-sans"
        >
          {submitting ? "Submitting…" : "Submit for verification"}
        </button>
      </div>
    </form>
  );
}