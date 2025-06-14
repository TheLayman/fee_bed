import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 403 });
  }
  const { approved } = await req.json();
  const txn = await prisma.transaction.update({
    where: { id },
    data: { approved: !!approved },
    select: {
      id: true,
      approved: true,
    },
  });
  return NextResponse.json(txn);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 403 });
  }
  const txn = await prisma.transaction.findUnique({
    where: { id },
    select: { createdById: true, createdAt: true },
  });
  if (!txn) {
    return new NextResponse("Not found", { status: 404 });
  }
  const isAdmin = session.user.role === "admin";
  if (!isAdmin && txn.createdById !== session.user.id) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  if (!isAdmin) {
    const age = Date.now() - txn.createdAt.getTime();
    if (age > 5 * 60 * 1000) {
      return new NextResponse("Too late to delete", { status: 400 });
    }
  }
  await prisma.transaction.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
