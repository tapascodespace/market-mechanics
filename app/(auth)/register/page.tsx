"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/stores/auth-store";
import Card from "@/app/components/ui/Card";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";
import { LineChart } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const register = useAuthStore((s) => s.register);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const success = register(email, name, password);
    if (success) {
      router.push("/markets");
    } else {
      setError("Email already registered");
    }
  };

  return (
    <Card className="w-full max-w-sm p-6">
      <div className="flex items-center gap-2 justify-center mb-6">
        <LineChart className="w-7 h-7 text-[var(--amber)]" />
        <span className="font-bold text-xl tracking-tight">REESHAW</span>
      </div>

      <h2 className="text-lg font-semibold text-center mb-1">Create account</h2>
      <p className="text-sm text-[var(--muted)] text-center mb-6">
        Start with $100,000 paper balance
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-[var(--muted)] mb-1 block">Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
          />
        </div>
        <div>
          <label className="text-xs text-[var(--muted)] mb-1 block">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label className="text-xs text-[var(--muted)] mb-1 block">Password</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Choose a password"
            required
            minLength={6}
          />
        </div>

        {error && (
          <p className="text-xs text-[var(--red)] text-center">{error}</p>
        )}

        <Button type="submit" className="w-full" size="lg">
          Create Account
        </Button>
      </form>

      <p className="text-sm text-[var(--muted)] text-center mt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--amber)] hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
