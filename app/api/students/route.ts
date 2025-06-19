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
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || undefined;
  const where = q
    ? { name: { contains: q, mode: Prisma.QueryMode.insensitive } }
    : undefined;
  const students = await prisma.student.findMany({
    where,
    select: { id: true, name: true, batch: true, totalFee: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(students);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 403 });
  }
  const { name, batch, totalFee } = await req.json();
  if (!name || !batch || totalFee === undefined) {
    return new NextResponse("Missing fields", { status: 400 });
  }
  try {
    const student = await prisma.student.create({
      data: { name, batch, totalFee: Math.round(Number(totalFee)).toString() },
      select: { id: true, name: true, batch: true, totalFee: true },
    });
    return NextResponse.json(student, { status: 201 });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return new NextResponse("Student already exists", { status: 400 });
    }
    throw err;
  }
}
