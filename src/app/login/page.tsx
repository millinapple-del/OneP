 "use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function signInWithGoogle() {
    setBusy(true); setError("");
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=/profile`;
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
      if (error) throw error;
    } catch (e) { setError(e instanceof Error ? e.message : "Could not start Google sign-in."); setBusy(false); }
  }
  return <main className="grid min-h-screen place-items-center px-4 py-12"><div className="w-full max-w-md border border-black/10 bg-white p-7 sm:p-10"><Link href="/" className="text-sm font-bold text-neutral-500"><ArrowLeft className="mr-1 inline" size={15}/> Back to OneP</Link><div className="mt-8 flex items-center gap-2 text-3xl font-black">OneP<span className="h-3 w-3 bg-[#ebf21b]"/></div><h1 className="mt-6 text-2xl font-black">Welcome to your people.</h1><p className="mt-2 text-sm leading-6 text-neutral-500">Sign in to join the feed, discover the marketplace, and connect with your community.</p><button onClick={signInWithGoogle} disabled={busy} className="mt-8 flex w-full items-center justify-center gap-3 border border-black px-4 py-3 text-sm font-bold hover:bg-[#ebf21b] disabled:opacity-50">{busy ? <LoaderCircle className="animate-spin" size={18}/> : <GoogleIcon/>} Continue with Google</button>{error && <p role="alert" className="mt-4 break-words text-sm text-red-600">{error}</p>}<p className="mt-6 text-xs leading-5 text-neutral-500">Google sign-in must be enabled in Supabase Authentication, with the Google provider configured.</p></div></main>;
}
function GoogleIcon() { return <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.96 46.98 31.84 46.98 24.55z"/><path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>}
