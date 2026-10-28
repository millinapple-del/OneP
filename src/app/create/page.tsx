 "use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ImagePlus, LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function CreatePage() {
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMessage("");
    if (files.length > 2) { setMessage("Choose no more than 2 photos."); return; }
    setBusy(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      const paths: string[] = [];
      for (const file of files) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${user.id}/${crypto.randomUUID()}-${safeName}`;
        const { error } = await supabase.storage.from("post-images").upload(path, file, { upsert: false });
        if (error) throw error;
        paths.push(path);
      }
      const response = await fetch("/api/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content, images: paths }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not create post.");
      window.location.href = "/";
    } catch (e) { setMessage(e instanceof Error ? e.message : "Could not create post."); }
    finally { setBusy(false); }
  }
  return <main className="mx-auto min-h-screen max-w-2xl px-4 py-8"><Link href="/" className="text-sm font-bold text-neutral-500"><ArrowLeft className="mr-1 inline" size={16}/> Feed</Link><h1 className="mt-8 text-3xl font-black">Create a post</h1><p className="mt-2 text-sm text-neutral-500">A little moment, a new discovery, something worth sharing.</p><form onSubmit={submit} className="mt-7 space-y-5 border border-black/10 bg-white p-5 sm:p-7"><label className="block text-sm font-bold">What’s on your mind?<textarea value={content} onChange={e => setContent(e.target.value)} maxLength={2000} rows={6} placeholder="Share something with your community…" className="mt-2 w-full resize-y border border-black/15 p-3 text-sm font-normal outline-none focus:border-black"/></label><label className="block text-sm font-bold">Photos <span className="font-normal text-neutral-500">(up to 2)</span><span className="mt-2 flex cursor-pointer items-center gap-3 border border-dashed border-black/20 p-4 text-sm font-normal"><ImagePlus size={20}/>{files.length ? `${files.length} photo(s) selected` : "Choose photos"}<input type="file" accept="image/*" multiple className="sr-only" onChange={e => setFiles(Array.from(e.target.files || []).slice(0, 3))}/></span></label>{files.length > 2 && <p className="text-sm text-red-600">Select no more than 2 photos.</p>}{message && <p role="alert" className="break-words text-sm text-red-600">{message}</p>}<button disabled={busy || files.length > 2} className="flex w-full items-center justify-center gap-2 bg-[#ebf21b] px-4 py-3 text-sm font-black disabled:opacity-50">{busy && <LoaderCircle className="animate-spin" size={17}/>}Publish post</button></form></main>;
}
