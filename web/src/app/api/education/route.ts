import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateProfileId } from "@/lib/get-profile";

// GET /api/education — list all education entries for the current profile, in display order
export async function GET() {
  const profileId = await getOrCreateProfileId();
  const education = await prisma.education.findMany({
    where: { profileId },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(education);
}

// POST /api/education — create a new education entry, appended to the end
export async function POST(request: NextRequest) {
  const profileId = await getOrCreateProfileId();
  const body = await request.json();

  const count = await prisma.education.count({ where: { profileId } });

  const entry = await prisma.education.create({
    data: {
      profileId,
      institution: body.institution ?? "",
      degree: body.degree ?? "",
      field: body.field || null,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      notes: body.notes || null,
      order: count,
    },
  });

  return NextResponse.json(entry);
}
