import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SearchBar from "./SearchBar";

export default async function Header() {
  const session = await getServerSession(authOptions);
  return (
    <header className="bg-indigo-700 text-white">
      <nav className="max-w-5xl mx-auto flex flex-wrap items-center justify-between p-4 gap-4">
        <Link href="/" className="font-semibold text-lg leading-tight">
          Jagannatha Group B.Ed Colleges
          <span className="block text-sm font-normal">Fee Portal</span>
        </Link>
        <div className="flex items-center gap-4 flex-wrap">
          {session && <SearchBar />}
          {session && (
            <>
              <Link href="/students" className="hover:underline">Students</Link>
              <Link href="/transactions" className="hover:underline">Transactions</Link>
              <Link href="/reports" className="hover:underline">Reports</Link>
              {session.user.role === "admin" && (
                <>
                  <Link href="/users" className="hover:underline">Users</Link>
                  <Link href="/approvals" className="hover:underline">Approvals</Link>
                </>
              )}
            </>
          )}
          {session ? (
            <form action="/api/auth/signout" method="post">
              <button className="underline hover:opacity-80">Sign out</button>
            </form>
          ) : (
            <Link href="/login" className="underline">Login</Link>
          )}
        </div>
      </nav>
    </header>
  );
}
