import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TransactionsClient from "./TransactionsClient";

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }
  const students = await prisma.student.findMany({
    select: { id: true, name: true, batch: true },
  });
  const txns = await prisma.transaction.findMany({
    select: {
      id: true,
      studentId: true,
      student: { select: { name: true, batch: true } },
      type: true,
      amount: true,
      mode: true,
      approved: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
  const transactions = txns.map((t) => ({
    ...t,
    amount: t.amount.toString(),
    createdAt: t.createdAt.toISOString(),
  }));
  return (
    <TransactionsClient
      students={students}
      initialTransactions={transactions}
      isAdmin={session.user.role === "admin"}
    />
  );
}
