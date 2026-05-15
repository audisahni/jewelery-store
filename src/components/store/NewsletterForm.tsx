"use client";

import { useState, FormEvent } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      // Replace with real API call when newsletter endpoint is available
      await new Promise((r) => setTimeout(r, 800));
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p className="font-body text-sm text-primary">
        Thank you for subscribing.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex border border-border">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          required
          className="flex-1 min-w-0 bg-transparent px-3 py-2.5 font-body text-sm text-foreground placeholder:text-muted outline-none"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="shrink-0 px-4 py-2.5 bg-foreground text-background font-accent text-[10px] tracking-widest uppercase hover:bg-primary transition-colors disabled:opacity-60"
        >
          {status === "loading" ? "…" : "Join"}
        </button>
      </div>
      {status === "error" && (
        <p className="font-body text-xs text-destructive">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
