import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import HomeClient from "./HomeClient";

export default async function Home() {
  const session = await getServerSession(authOptions);
  return (
    <div className="p-6 space-y-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">List of Students</h1>
      {session ? (
        <HomeClient />
      ) : (
        <p>
          <Link href="/login" className="text-blue-600 underline">
            Login
          </Link>{" "}
          to continue.
        </p>
      )}
    </div>
  );
}
