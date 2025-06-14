import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ReportsClient from "./ReportsClient";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }
  const students = await prisma.student.findMany({
    select: { id: true, name: true, batch: true },
  });
  return <ReportsClient students={students} />;
}
