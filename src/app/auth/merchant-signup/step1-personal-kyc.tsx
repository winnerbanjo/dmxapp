"use client";

import type { PersonalKycData } from "./page";

const INPUT_CLASS =
  "mt-2 w-full rounded-none border border-zinc-200 bg-white px-4 py-3 font-sans text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#5e1914] focus:outline-none focus:ring-1 focus:ring-[#5e1914]";
const LABEL_CLASS = "block text-xs font-medium uppercase tracking-wider text-zinc-500 font-sans";

export function MerchantSignupStep1({
  data,
  onChange,
  onNext,
}: {
  data: PersonalKycData;
  onChange: (d: PersonalKycData) => void;
  onNext: () => void;
}) {
  const valid =
    data.email.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) &&
    (data.password?.length ?? 0) >= 6 &&
    data.fullName.trim() &&
    data.dateOfBirth;

  return (
    <form
      className="mt-10 space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onNext();
      }}
    >
      <div>
        <label htmlFor="email" className={LABEL_CLASS}>
          Email
        </label>
        <input
          id="email"
          type="email"
          value={data.email}
          onChange={(e) => onChange({ ...data, email: e.target.value })}
          placeholder="you@company.com"
          className={INPUT_CLASS}
          required
        />
      </div>
      <div>
        <label htmlFor="password" className={LABEL_CLASS}>
          Password
        </label>
        <input
          id="password"
          type="password"
          value={data.password}
          onChange={(e) => onChange({ ...data, password: e.target.value })}
          placeholder="Min 6 characters"
          minLength={6}
          className={INPUT_CLASS}
          required
        />
      </div>
      <div>
        <label htmlFor="fullName" className={LABEL_CLASS}>
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          value={data.fullName}
          onChange={(e) => onChange({ ...data, fullName: e.target.value })}
          placeholder="As on government ID"
          className={INPUT_CLASS}
          required
        />
      </div>
      <div>
        <label htmlFor="dateOfBirth" className={LABEL_CLASS}>
          Date of Birth
        </label>
        <input
          id="dateOfBirth"
          type="date"
          value={data.dateOfBirth}
          onChange={(e) => onChange({ ...data, dateOfBirth: e.target.value })}
          className={INPUT_CLASS}
          required
        />
      </div>
      <div>
        <label htmlFor="idType" className={LABEL_CLASS}>
          Government ID Type
        </label>
        <select
          id="idType"
          value={data.idType}
          onChange={(e) => onChange({ ...data, idType: e.target.value as PersonalKycData["idType"] })}
          className={INPUT_CLASS}
        >
          <option value="NIN">NIN</option>
          <option value="Passport">Passport</option>
          <option value="BVN">BVN</option>
        </select>
      </div>
      <div>
        <label className={LABEL_CLASS}>Government ID Upload</label>
        <div className="mt-2 flex min-h-[120px] flex-col items-center justify-center rounded-none border-2 border-dashed border-zinc-200 bg-zinc-50 p-6">
          <input
            type="file"
            accept=".pdf,image/*"
            className="hidden"
            id="id-doc"
            onChange={(e) => onChange({ ...data, idDocumentFile: e.target.files?.[0] ?? null })}
          />
          <label htmlFor="id-doc" className="cursor-pointer text-center text-sm text-zinc-500 font-sans">
            {data.idDocumentFile ? data.idDocumentFile.name : "Upload NIN / Passport / BVN document (PDF or image)"}
          </label>
        </div>
      </div>
      <button
        type="submit"
        disabled={!valid}
        className="w-full rounded-none bg-[#5e1914] py-4 text-sm font-medium text-white hover:bg-[#4a130f] disabled:opacity-50 font-sans"
      >
        Continue to Business KYC
      </button>
    </form>
  );
}