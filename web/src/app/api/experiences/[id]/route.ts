import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/experiences/:id — update one experience's fields, including bullets
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = await request.json();

  const experience = await prisma.experience.update({
    where: { id: params.id },
    data: {
      organization: body.organization,
      title: body.title,
      location: body.location || null,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : null,
      bullets: body.bullets ?? [],
    },
  });

  return NextResponse.json(experience);
}

// DELETE /api/experiences/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  await prisma.experience.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
