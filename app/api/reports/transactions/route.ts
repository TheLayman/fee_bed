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
  const name = searchParams.get("name");
  const batch = searchParams.get("batch");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const where: Prisma.TransactionWhereInput = {};
  if (name || batch) {
    where.student = {
      ...(name
        ? { name: { contains: name, mode: "insensitive" } }
        : {}),
      ...(batch ? { batch } : {}),
    };
  }
  if (start || end) {
    where.createdAt = {};
    if (start) (where.createdAt as any).gte = new Date(start);
    if (end) {
      const d = new Date(end);
      d.setDate(d.getDate() + 1);
      (where.createdAt as any).lte = d;
    }
  }

  const txns = await prisma.transaction.findMany({
    where,
    select: {
      id: true,
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

  const modeTotalsRaw = await prisma.transaction.groupBy({
    by: ["mode"],
    where: { ...where, type: "payment", mode: { not: null } },
    _sum: { amount: true },
  });
  const totals = modeTotalsRaw.map((m) => ({
    mode: m.mode!,
    amount: m._sum.amount?.toString() || "0",
  }));

  return NextResponse.json({ transactions, totals });
}
