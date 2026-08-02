import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateDemoUser } from "@/lib/demo-user";

// GET /api/profile
// Returns the current user's profile, creating an empty one on first visit
// so the UI always has something to render into a form.
export async function GET() {
  const user = await getOrCreateDemoUser();

  let profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    profile = await prisma.profile.create({
      data: {
        userId: user.id,
        fullName: "",
        email: user.email,
      },
    });
  }

  return NextResponse.json(profile);
}

// PUT /api/profile
// Updates the basic profile fields only. Experiences/education/skills/
// projects get their own nested endpoints in the next pass.
export async function PUT(request: NextRequest) {
  const user = await getOrCreateDemoUser();
  const body = await request.json();

  const {
    fullName,
    headline,
    email,
    phone,
    location,
    linkedin,
    github,
    summary,
  } = body;

  const profile = await prisma.profile.upsert({
    where: { userId: user.id },
    update: {
      fullName,
      headline,
      email,
      phone,
      location,
      linkedin,
      github,
      summary,
    },
    create: {
      userId: user.id,
      fullName: fullName ?? "",
      email: email ?? user.email,
      headline,
      phone,
      location,
      linkedin,
      github,
      summary,
    },
  });

  return NextResponse.json(profile);
}
