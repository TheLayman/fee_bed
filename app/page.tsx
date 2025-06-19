import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);
  return (
    <div className="p-6 text-center space-y-4">
      <h1 className="text-2xl font-bold">
        Welcome to Jagannatha Group B.Ed Colleges Fee Portal
      </h1>
      {session ? (
        <p>Use the navigation above to manage students.</p>
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
