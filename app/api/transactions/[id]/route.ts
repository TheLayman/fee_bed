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
