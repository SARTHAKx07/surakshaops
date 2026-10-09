import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "../lib/supabase";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      if (mode === "signup") {
        if (password.length < 8) throw new Error("Use a password with at least 8 characters.");
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: name.trim() } },
        });
        if (error) throw error;
        if (data.session) {
          await navigate({ to: "/" });
        } else {
          setMessage("Account created. Check your email to confirm your account, then sign in.");
          setMode("login");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        await navigate({ to: "/" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5 rounded-xl border border-border bg-card p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">SurakshaOps</h1>
          <p className="mt-2 text-sm text-muted-foreground">Coal Mine Productivity &amp; Safety Management System</p>
          <h2 className="mt-6 text-lg font-semibold text-foreground">{mode === "login" ? "Sign in to your account" : "Create your account"}</h2>
        </div>

        {mode === "signup" && <div>
          <label className="mb-1 block text-sm text-foreground" htmlFor="full-name">Full name</label>
          <input id="full-name" type="text" required autoComplete="name" value={name} onChange={e => setName(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground" placeholder="Your full name" />
        </div>}
        <div>
          <label className="mb-1 block text-sm text-foreground" htmlFor="email">Email</label>
          <input id="email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground" placeholder="you@example.com" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-foreground" htmlFor="password">Password</label>
          <input id="password" type="password" required minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground" placeholder={mode === "login" ? "Enter your password" : "At least 8 characters"} />
        </div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
        <button type="submit" disabled={loading} className="w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-50">{loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}</button>
        <p className="text-center text-sm text-muted-foreground">
          {mode === "login" ? "New to SurakshaOps? " : "Already have an account? "}
          <button type="button" className="font-medium text-primary underline underline-offset-4" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setMessage(""); }}>
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
        {mode === "signup" && <p className="text-center text-xs text-muted-foreground">New accounts receive the Employee role by default. Admin access cannot be selected during sign-up.</p>}
      </form>
    </main>
  );
}
