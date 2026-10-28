import Link from "next/link";
import { ArrowUpRight, Camera, MessageCircle, ShoppingBag, Users, Plus, Search, Heart, Image as ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type Post = { id: string; content: string | null; created_at: string; profiles?: { username: string | null; full_name: string | null; avatar_url: string | null } | null };

export default async function Home() {
  let posts: Post[] = [];
  let configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (configured) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.from("posts").select("id, content, created_at, profiles(username, full_name, avatar_url)").order("created_at", { ascending: false }).limit(12);
      posts = (data ?? []) as unknown as Post[];
    } catch { /* Keep the starter UI usable before the database is configured. */ }
  }
  return <main className="min-h-screen pb-24">
    <header className="sticky top-0 z-20 border-b border-black/10 bg-[#f7f7f4]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-2xl font-black tracking-tight">OneP<span className="inline-block h-3 w-3 bg-[#ebf21b]" /></Link>
        <div className="hidden items-center gap-2 rounded-none border border-black/15 bg-white px-3 py-2 text-sm text-neutral-500 sm:flex"><Search size={16}/> Search people, posts, products</div>
        <Link href="/login" className="bg-black px-4 py-2 text-sm font-bold text-white hover:bg-neutral-700">Sign in <ArrowUpRight className="ml-1 inline" size={15}/></Link>
      </div>
    </header>
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[220px_minmax(0,640px)_240px]">
      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-2">
          <p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-neutral-500">Your space</p>
          <NavItem href="/" icon={<Users size={18}/>} label="Home feed" active/>
          <NavItem href="/market" icon={<ShoppingBag size={18}/>} label="Marketplace"/>
          <NavItem href="/create" icon={<Plus size={18}/>} label="Create post"/>
          <NavItem href="/chat" icon={<MessageCircle size={18}/>} label="Messages"/>
          <NavItem href="/profile" icon={<Users size={18}/>} label="My profile"/>
          <div className="mt-8 border border-black/10 bg-white p-4"><span className="text-xs font-bold uppercase tracking-widest">OneP principle</span><p className="mt-2 text-sm leading-6 text-neutral-600">One place to share what matters, find your next favorite thing, and connect.</p></div>
        </div>
      </aside>
      <section>
        <div className="mb-7 bg-[#ebf21b] p-6 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[.22em]">Your people. Your finds. Your feed.</p>
          <h1 className="mt-3 max-w-lg text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl">Make room for what moves you.</h1>
          <p className="mt-4 max-w-md text-sm leading-6">Share moments, discover products, and stay close to your community.</p>
          <Link href="/create" className="mt-6 inline-flex items-center gap-2 bg-black px-4 py-3 text-sm font-bold text-white">Create a post <ArrowUpRight size={16}/></Link>
        </div>
        <div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-black">The feed</h2><span className="text-xs text-neutral-500">Fresh from the community</span></div>
        {posts.length ? <div className="space-y-4">{posts.map(post => <article key={post.id} className="border border-black/10 bg-white p-5"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center bg-[#ebf21b] font-black">{(post.profiles?.full_name || post.profiles?.username || "O").slice(0,1).toUpperCase()}</div><div><p className="text-sm font-bold">{post.profiles?.full_name || post.profiles?.username || "OneP member"}</p><p className="text-xs text-neutral-500">{new Date(post.created_at).toLocaleDateString()}</p></div></div><p className="mt-4 whitespace-pre-wrap text-sm leading-6">{post.content}</p><div className="mt-4 flex gap-4 border-t border-black/10 pt-3 text-xs text-neutral-500"><span><Heart className="mr-1 inline" size={15}/> Like</span><span><MessageCircle className="mr-1 inline" size={15}/> Comment</span></div></article>)}</div> : <div className="border border-dashed border-black/20 bg-white p-8 text-center sm:p-12"><div className="mx-auto grid h-14 w-14 place-items-center bg-[#ebf21b]"><Camera size={24}/></div><h3 className="mt-4 text-lg font-black">Your community starts here</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-neutral-500">{configured ? "No posts yet. Be the first to share a moment." : "Connect Supabase to load real posts. You can explore the starter UI while setting up your project."}</p><Link href="/create" className="mt-5 inline-flex items-center gap-2 border border-black px-4 py-3 text-sm font-bold">Share your first post <Plus size={16}/></Link></div>}
      </section>
      <aside className="hidden space-y-4 lg:block">
        <div className="border border-black/10 bg-white p-5"><p className="text-xs font-bold uppercase tracking-widest">Explore OneP</p><Feature icon={<ShoppingBag size={18}/>} title="Marketplace" body="Discover items from your community." href="/market"/><Feature icon={<MessageCircle size={18}/>} title="Conversations" body="Keep up with the people you care about." href="/chat"/><Feature icon={<ImageIcon size={18}/>} title="Your story" body="Share up to two photos per post." href="/create"/></div>
        <p className="text-xs leading-5 text-neutral-500">Built for community. Designed for everyday moments.</p>
      </aside>
    </div>
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-black/10 bg-white/95 backdrop-blur lg:hidden"><div className="mx-auto grid max-w-lg grid-cols-5 px-1 py-2"><MobileItem href="/" label="Home" icon={<Users size={19}/>} active/><MobileItem href="/market" label="Market" icon={<ShoppingBag size={19}/>}/><MobileItem href="/create" label="Create" icon={<Plus size={22}/>}/><MobileItem href="/chat" label="Chat" icon={<MessageCircle size={19}/>}/><MobileItem href="/profile" label="Profile" icon={<Users size={19}/>}/></div></nav>
  </main>;
}
function NavItem({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) { return <Link href={href} className={`flex items-center gap-3 px-3 py-3 text-sm font-semibold ${active ? "bg-[#ebf21b]" : "hover:bg-white"}`}>{icon}{label}</Link>; }
function Feature({ icon, title, body, href }: { icon: React.ReactNode; title: string; body: string; href: string }) { return <Link href={href} className="mt-5 flex gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center bg-[#ebf21b]">{icon}</div><div><p className="text-sm font-bold">{title}</p><p className="mt-1 text-xs leading-5 text-neutral-500">{body}</p></div></Link>; }
function MobileItem({ href, label, icon, active = false }: { href: string; label: string; icon: React.ReactNode; active?: boolean }) { return <Link href={href} className={`flex flex-col items-center gap-1 py-1 text-[10px] font-bold ${active ? "text-black" : "text-neutral-500"}`}><span className={active ? "bg-[#ebf21b] p-2" : "p-2"}>{icon}</span>{label}</Link>; }
