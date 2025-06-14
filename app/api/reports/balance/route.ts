import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  const name = searchParams.get("name");
  const batch = searchParams.get("batch");

  let students;
  if (studentId) {
    const s = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, name: true, batch: true, totalFee: true },
    });
    students = s ? [s] : [];
  } else {
    students = await prisma.student.findMany({
      where: {
        ...(name
          ? { name: { contains: name, mode: Prisma.QueryMode.insensitive } }
          : {}),
        ...(batch ? { batch } : {}),
      },
      select: { id: true, name: true, batch: true, totalFee: true },
    });
  }

  const results = [] as { id: string; name: string; batch: string; balance: string }[];
  for (const s of students) {
    const agg = await prisma.transaction.aggregate({
      where: { studentId: s.id, approved: true },
      _sum: { amount: true },
    });
    const paid = parseFloat(agg._sum.amount?.toString() || "0");
    const total = parseFloat(s.totalFee.toString());
    const bal = (total - paid).toFixed(2);
    results.push({ id: s.id, name: s.name, batch: s.batch, balance: bal });
  }
  return NextResponse.json(results);
}
