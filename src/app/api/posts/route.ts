import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let body: { content?: unknown; images?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }
  const images = body.images;
  if (!Array.isArray(images)) return NextResponse.json({ error: "images must be an array." }, { status: 400 });
  if (images.length > 2) return NextResponse.json({ error: "A post can contain at most 2 images." }, { status: 400 });
  if (images.some((image) => typeof image !== "string")) return NextResponse.json({ error: "Each image must be a storage path string." }, { status: 400 });
  if (body.content !== undefined && typeof body.content !== "string") return NextResponse.json({ error: "content must be a string." }, { status: 400 });
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Sign in to create a post." }, { status: 401 });
  const { data: post, error } = await supabase.from("posts").insert({ user_id: user.id, content: (body.content as string | undefined)?.trim() || null }).select("id, content, created_at").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (images.length) {
    const rows = images.map((image, index) => ({ post_id: post.id, image_url: image, position: index }));
    const { error: imageError } = await supabase.from("post_images").insert(rows);
    if (imageError) {
      await supabase.from("posts").delete().eq("id", post.id);
      return NextResponse.json({ error: imageError.message }, { status: 400 });
    }
  }
  return NextResponse.json({ post }, { status: 201 });
}
