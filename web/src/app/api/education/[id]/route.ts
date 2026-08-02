import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/education/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = await request.json();

  const entry = await prisma.education.update({
    where: { id: params.id },
    data: {
      institution: body.institution,
      degree: body.degree,
      field: body.field || null,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      notes: body.notes || null,
    },
  });

  return NextResponse.json(entry);
}

// DELETE /api/education/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  await prisma.education.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
