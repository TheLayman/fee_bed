import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AgentClient from "./AgentClient";
import Link from "next/link";

export default async function AgentPage() {
  const session = await getServerSession(authOptions);
  
  return (
    <div className="p-6 space-y-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">Employee Knowledge Agent</h1>
      <p className="text-gray-600">
        Ask questions and get answers from SharePoint, OneDrive, and internal wikis.
      </p>
      
      {session ? (
        <AgentClient />
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p>
            Please{" "}
            <Link href="/login" className="text-blue-600 underline">
              login
            </Link>{" "}
            to use the Employee Knowledge Agent.
          </p>
        </div>
      )}
    </div>
  );
}