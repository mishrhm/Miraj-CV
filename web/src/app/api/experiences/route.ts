import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateProfileId } from "@/lib/get-profile";

// GET /api/experiences — list all experiences for the current profile, in display order
export async function GET() {
  const profileId = await getOrCreateProfileId();
  const experiences = await prisma.experience.findMany({
    where: { profileId },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(experiences);
}

// POST /api/experiences — create a new experience, appended to the end
export async function POST(request: NextRequest) {
  const profileId = await getOrCreateProfileId();
  const body = await request.json();

  const count = await prisma.experience.count({ where: { profileId } });

  const experience = await prisma.experience.create({
    data: {
      profileId,
      organization: body.organization ?? "",
      title: body.title ?? "",
      location: body.location || null,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : null,
      bullets: body.bullets ?? [],
      order: count,
    },
  });

  return NextResponse.json(experience);
}
