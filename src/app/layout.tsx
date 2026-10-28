import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OneP — People, posts & marketplace",
  description: "A social feed and community marketplace built with Next.js and Supabase."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
