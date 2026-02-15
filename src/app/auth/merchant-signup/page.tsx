"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MerchantSignupStep1 } from "./step1-personal-kyc";
import { MerchantSignupStep2 } from "./step2-business-kyc";

export type PersonalKycData = {
  email: string;
  password: string;
  fullName: string;
  dateOfBirth: string;
  idType: "NIN" | "Passport" | "BVN";
  idDocumentFile?: File | null;
};

export type BusinessKycData = {
  companyName: string;
  rcNumber: string;
  businessAddress: string;
  cacDocumentFile?: File | null;
};

export default function MerchantSignupPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [personalKyc, setPersonalKyc] = useState<PersonalKycData>({
    email: "",
    password: "",
    fullName: "",
    dateOfBirth: "",
    idType: "NIN",
  });
  const [businessKyc, setBusinessKyc] = useState<BusinessKycData>({
    companyName: "",
    rcNumber: "",
    businessAddress: "",
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-xl px-6 py-12">
        <header className="flex items-center gap-4 border-b border-zinc-100 pb-8">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden bg-white">
            <Image src="/dmxlogo.png" alt="DMX" fill className="object-contain" sizes="40px" />
          </div>
          <div>
            <h1 className="font-sans text-2xl font-semibold tracking-tighter text-zinc-900">
              Merchant Sign-Up
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Step {step} of 2 — {step === 1 ? "Personal KYC" : "Business KYC"}
            </p>
          </div>
        </header>

        {step === 1 ? (
          <MerchantSignupStep1
            data={personalKyc}
            onChange={setPersonalKyc}
            onNext={() => setStep(2)}
          />
        ) : (
          <MerchantSignupStep2
            data={businessKyc}
            onChange={setBusinessKyc}
            onBack={() => setStep(1)}
            onSubmit={async () => {
              await submitKyc(personalKyc, businessKyc);
              window.location.href = "/merchant/dashboard";
            }}
          />
        )}

        <p className="mt-10 text-center text-xs text-zinc-400">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-[#5e1914] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

async function submitKyc(_personal: PersonalKycData, _business: BusinessKycData) {
  const res = await fetch("/api/auth/merchant-kyc-signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: _personal.email,
      password: _personal.password,
      personalKyc: {
        fullName: _personal.fullName,
        dateOfBirth: _personal.dateOfBirth,
        idType: _personal.idType,
      },
      businessKyc: {
        companyName: _business.companyName,
        rcNumber: _business.rcNumber,
        businessAddress: _business.businessAddress,
      },
    }),
  });
  if (!res.ok) throw new Error("Sign-up failed");
  await res.json();
  // Cookie is set by API response
}