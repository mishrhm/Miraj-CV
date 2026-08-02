import { prisma } from "@/lib/prisma";
import { getOrCreateDemoUser } from "@/lib/demo-user";

export async function getOrCreateProfileId(): Promise<string> {
  const user = await getOrCreateDemoUser();

  let profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    profile = await prisma.profile.create({
      data: { userId: user.id, fullName: "", email: user.email },
    });
  }

  return profile.id;
}
