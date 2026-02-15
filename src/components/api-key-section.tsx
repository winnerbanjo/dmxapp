"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Key } from "lucide-react";

type Props = { initialApiKey?: string | null; hasProfile: boolean };

export function ApiKeySection({ initialApiKey, hasProfile }: Props) {
  const [apiKey, setApiKey] = useState(initialApiKey ?? "");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generateKey() {
    if (!hasProfile) return;
    setLoading(true);
    const res = await fetch("/api/merchant/api-key", { method: "POST" });
    setLoading(false);
    if (!res.ok) return;
    const data = await res.json();
    if (data.apiKey) setApiKey(data.apiKey);
  }

  function copyKey() {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>API Key</Label>
        <div className="flex gap-2">
          <Input
            readOnly
            value={apiKey || "No key generated"}
            className="font-mono text-sm"
          />
          {apiKey && (
            <Button type="button" variant="outline" size="icon" onClick={copyKey}>
              {copied ? "Copied!" : <Copy className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>
      <Button
        type="button"
        onClick={generateKey}
        disabled={loading || !hasProfile}
        className="gap-2"
      >
        <Key className="h-4 w-4" />
        {apiKey ? "Regenerate API Key" : "Generate API Key"}
      </Button>
      {!hasProfile && (
        <p className="text-sm text-slate-500">Complete your merchant profile to generate an API key.</p>
      )}
    </div>
  );
}
