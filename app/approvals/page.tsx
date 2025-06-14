import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ApprovalsClient from "./ApprovalsClient";

export default async function ApprovalsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    redirect("/");
  }
  const pending = await prisma.transaction.findMany({
    where: { type: "concession", approved: false },
    select: {
      id: true,
      student: { select: { name: true, batch: true } },
      amount: true,
    },
  });
  const approvals = pending.map((p) => ({
    ...p,
    amount: p.amount.toString(),
  }));
  return <ApprovalsClient initialApprovals={approvals} />;
}
