import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 403 });
  }
  const users = await prisma.user.findMany({
    select: { id: true, username: true, role: true },
  });
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 403 });
  }
  const { username, password, role } = await req.json();
  if (!username || !password) {
    return new NextResponse("Missing fields", { status: 400 });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: { username, passwordHash, role: role === "admin" ? "admin" : "user" },
      select: { id: true, username: true, role: true },
    });
    return NextResponse.json(user, { status: 201 });
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
