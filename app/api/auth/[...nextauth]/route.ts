import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// NextAuth relies on runtime data such as cookies and request headers.
// Mark this route as dynamic so Next.js doesn't attempt to prerender it.
export const dynamic = "force-dynamic";
// Ensure the handler runs on the Node runtime rather than the Edge runtime.
export const runtime = "nodejs";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
