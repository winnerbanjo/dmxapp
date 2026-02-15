"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateMerchantProfile, generateApiKey } from "./settings-actions";
import { Key, Copy, Check } from "lucide-react";

type Profile = { businessName: string; email: string; phone: string; address: string };

export function SettingsClient({
  profile,
  apiKeyMasked,
}: {
  profile: Profile;
  apiKeyMasked: string;
}) {
  const [state, formAction] = useFormState(updateMerchantProfile, null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleGenerateKey() {
    setGenerating(true);
    const result = await generateApiKey();
    setGenerating(false);
    if (result.apiKey) setApiKey(result.apiKey);
  }

  function handleCopy() {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="mt-12 space-y-16">
      {/* Business details */}
      <section className="border-b border-zinc-100 pb-12">
        <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Business details
        </h2>
        <form action={formAction} className="mt-8 space-y-6">
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          {state?.ok && <p className="text-sm text-green-600">Saved.</p>}
          <div>
            <Label htmlFor="businessName" className="text-zinc-700">Business name</Label>
            <Input
              id="businessName"
              name="businessName"
              defaultValue={profile.businessName}
              className="mt-2 h-12 rounded-none border-zinc-100"
              required
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-zinc-700">Email</Label>
            <Input
              id="email"
              name="email"
              defaultValue={profile.email}
              readOnly
              className="mt-2 h-12 rounded-none border-zinc-100 bg-zinc-50"
            />
          </div>
          <div>
            <Label htmlFor="phone" className="text-zinc-700">Phone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={profile.phone}
              className="mt-2 h-12 rounded-none border-zinc-100"
              placeholder="+234 800 000 0000"
            />
          </div>
          <div>
            <Label htmlFor="address" className="text-zinc-700">Address</Label>
            <Input
              id="address"
              name="address"
              defaultValue={profile.address}
              className="mt-2 h-12 rounded-none border-zinc-100"
            />
          </div>
          <Button type="submit" className="rounded-none bg-[#5e1914] hover:bg-[#4a130f]">
            Save
          </Button>
        </form>
      </section>

      {/* Settlement Bank */}
      <section className="border-b border-zinc-100 pb-12">
        <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Settlement bank
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          Bank account for receiving payouts.
        </p>
        <div className="mt-8 space-y-6">
          <div>
            <Label htmlFor="bankName" className="text-zinc-700">Settlement bank</Label>
            <Input
              id="bankName"
              placeholder="e.g. GTBank"
              className="mt-2 h-12 rounded-none border-zinc-100"
            />
          </div>
          <div>
            <Label htmlFor="accountNumber" className="text-zinc-700">Account number</Label>
            <Input
              id="accountNumber"
              placeholder="10 digits"
              className="mt-2 h-12 rounded-none border-zinc-100"
            />
          </div>
          <div>
            <Label htmlFor="accountName" className="text-zinc-700">Account name</Label>
            <Input
              id="accountName"
              placeholder="As on bank account"
              className="mt-2 h-12 rounded-none border-zinc-100"
            />
          </div>
        </div>
      </section>

      {/* API keys — website integration */}
      <section>
        <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          API keys
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          For website integration. Use this key to connect your app to DMX.
        </p>
        <div className="mt-8 border border-zinc-100 bg-zinc-50 p-6">
          <div className="flex items-center gap-4">
            <Key strokeWidth={1} className="h-5 w-5 text-zinc-500" />
            <div className="flex-1 font-mono text-sm text-zinc-900">
              {apiKey ? (
                <span>{apiKey}</span>
              ) : (
                <span>{apiKeyMasked || "No key generated"}</span>
              )}
            </div>
            {apiKey && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-none border-zinc-100"
                onClick={handleCopy}
              >
                {copied ? <Check strokeWidth={1} className="h-4 w-4" /> : <Copy strokeWidth={1} className="h-4 w-4" />}
              </Button>
            )}
          </div>
          <Button
            type="button"
            onClick={handleGenerateKey}
            disabled={generating}
            className="mt-4 rounded-none bg-[#5e1914] hover:bg-[#4a130f]"
          >
            {generating ? "Generating…" : apiKeyMasked || apiKey ? "Regenerate API key" : "Generate API key"}
          </Button>
          {apiKey && (
            <p className="mt-3 text-xs text-amber-700">
              Copy this key now. It won’t be shown again in full.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
