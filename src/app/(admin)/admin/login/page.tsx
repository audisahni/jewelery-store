"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
    } else {
      router.push("/admin");
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-background p-10">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl text-foreground mb-2">EZMAY</h1>
          <p className="font-accent text-xs tracking-[0.2em] uppercase text-muted">By Gurleen · Admin</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-accent text-xs tracking-wider uppercase text-muted mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border border-border px-4 py-3 text-sm font-body outline-none focus:border-primary transition-colors bg-transparent"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block font-accent text-xs tracking-wider uppercase text-muted mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full border border-border px-4 py-3 text-sm font-body outline-none focus:border-primary transition-colors bg-transparent"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-destructive text-sm font-body text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground text-background font-accent text-xs tracking-[0.2em] uppercase py-4 hover:bg-primary transition-colors duration-300 disabled:opacity-50 mt-2"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center mt-8 font-body text-xs text-muted">
          This area is restricted to authorized personnel.
        </p>
      </div>
    </div>
  );
}
