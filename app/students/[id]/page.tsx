import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StudentClient from "./StudentClient";

export default async function StudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }
  const student = await prisma.student.findUnique({
    where: { id },
    select: { id: true, name: true, batch: true, totalFee: true },
  });
  if (!student) redirect("/students");
  const txns = await prisma.transaction.findMany({
    where: { studentId: id },
    select: {
      id: true,
      studentId: true,
      createdById: true,
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
    <StudentClient
      student={{ ...student, totalFee: student.totalFee.toString() }}
      initialTransactions={transactions}
      isAdmin={session.user.role === "admin"}
      userId={session.user.id}
    />
  );
}
