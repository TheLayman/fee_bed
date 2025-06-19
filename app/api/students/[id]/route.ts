import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 403 });
  }
  const { name, batch, totalFee } = await req.json();
  try {
    const student = await prisma.student.update({
      where: { id },
      data: { name, batch, totalFee: Math.round(Number(totalFee)).toString() },
      select: { id: true, name: true, batch: true, totalFee: true },
    });
    return NextResponse.json(student);
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

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  return PUT(req, ctx);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 403 });
  }
  await prisma.student.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
