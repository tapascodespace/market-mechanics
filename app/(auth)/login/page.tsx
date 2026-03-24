"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/stores/auth-store";
import Input from "@/app/components/ui/Input";
import { ParticleButton } from "@/app/components/ui/particle-button";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const success = login(email, password);
    if (success) {
      router.push("/markets");
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10">
        <svg viewBox="0 0 64 64" className="w-8 h-8">
          <path d="M12 18 L20 4 L28 18 Z" fill="var(--text)" />
          <path d="M36 18 L44 4 L52 18 Z" fill="var(--text)" />
          <ellipse cx="32" cy="36" rx="22" ry="24" fill="var(--text)" />
          <circle cx="24" cy="32" r="3.5" fill="var(--bg)" />
          <circle cx="40" cy="32" r="3.5" fill="var(--bg)" />
        </svg>
        <span className="text-lg font-bold">Reeshaw</span>
      </div>

      <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back</h1>
      <p className="text-[var(--text-secondary)] text-sm mb-8">
        Sign in to your account
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-sm font-medium text-[var(--text)] mb-2 block">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[var(--text)] mb-2 block">Password</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            required
          />
        </div>

        {error && (
          <p className="text-sm text-[var(--red)]">{error}</p>
        )}

        <ParticleButton type="submit" className="w-full" size="lg">
          Sign In
        </ParticleButton>
      </form>

      <p className="text-sm text-[var(--text-secondary)] mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-[var(--text)] font-semibold hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
