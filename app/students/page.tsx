import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StudentsClient from "./StudentsClient";

export default async function StudentsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }
  const dbStudents = await prisma.student.findMany({
    select: { id: true, name: true, batch: true, totalFee: true },
  });
  const students = dbStudents.map((s) => ({
    ...s,
    totalFee: s.totalFee.toString(),
  }));
  return (
    <StudentsClient
      initialStudents={students}
      isAdmin={session.user.role === "admin"}
    />
  );
}
