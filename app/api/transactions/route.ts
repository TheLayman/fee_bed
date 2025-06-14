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
  const studentId = url.searchParams.get("studentId") || undefined;
  const txns = await prisma.transaction.findMany({
    where: studentId ? { studentId } : undefined,
    select: {
      id: true,
      studentId: true,
      student: { select: { name: true, batch: true } },
      createdById: true,
      type: true,
      amount: true,
      mode: true,
      approved: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
  const data = txns.map((t) => ({
    ...t,
    amount: t.amount.toString(),
    createdAt: t.createdAt.toISOString(),
  }));
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 403 });
  }
  const { studentId, type, amount, mode } = await req.json();
  if (!studentId || !type || !amount) {
    return new NextResponse("Missing fields", { status: 400 });
  }
  if (type !== "payment" && type !== "concession") {
    return new NextResponse("Invalid type", { status: 400 });
  }
  if (type === "payment" && mode !== "cash" && mode !== "online") {
    return new NextResponse("Invalid payment mode", { status: 400 });
  }
  try {
    const txn = await prisma.transaction.create({
      data: {
        studentId,
        createdById: session.user.id!,
        type,
        amount: amount.toString(),
        mode: type === "payment" ? mode : null,
        approved: type === "payment" ? true : false,
      },
      select: {
        id: true,
        studentId: true,
        student: { select: { name: true, batch: true } },
        createdById: true,
        type: true,
        amount: true,
        mode: true,
        approved: true,
        createdAt: true,
      },
    });
    return NextResponse.json(
      {
        ...txn,
        amount: txn.amount.toString(),
        createdAt: txn.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2003"
    ) {
      return new NextResponse("Invalid student", { status: 400 });
    }
    throw err;
  }
}
