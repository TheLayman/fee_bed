import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 403 });
  }
  await prisma.user.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 403 });
  }
  const { username, role, password } = await req.json();
  const data: any = {
    username,
    role: role === "admin" ? "admin" : "user",
  };
  if (password) {
    data.passwordHash = await bcrypt.hash(password, 10);
  }
  try {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, username: true, role: true },
    });
    return NextResponse.json(user);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return new NextResponse("Username already exists", { status: 400 });
    }
    throw err;
  }
}

export const PATCH = PUT;
