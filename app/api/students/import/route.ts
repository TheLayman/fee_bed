import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 403 });
  }
  const { students } = await req.json();
  if (!Array.isArray(students)) {
    return new NextResponse("Invalid data", { status: 400 });
  }
  const data = students
    .filter((s: any) => s && s.name && s.batch && s.totalFee !== undefined)
    .map((s: any) => ({
      name: s.name,
      batch: s.batch,
      totalFee: Math.round(Number(s.totalFee)).toString(),
    }));
  if (data.length === 0) {
    return new NextResponse("No valid students", { status: 400 });
  }
  await prisma.student.createMany({ data, skipDuplicates: true });
  return new NextResponse(null, { status: 204 });
}
