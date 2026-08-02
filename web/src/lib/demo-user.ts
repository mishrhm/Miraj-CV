import { prisma } from "@/lib/prisma";

// Phase 0/1 stub: no auth yet, so every request operates against a single
// "demo" user. Once Clerk/Auth.js is wired up (Phase 9), this gets replaced
// by reading the real authenticated user's id from the session — nothing
// else in the app needs to change, since everything already goes through
// this function rather than hardcoding a user id.
const DEMO_USER_EMAIL = "demo@miraj-cv.local";

export async function getOrCreateDemoUser() {
  let user = await prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: DEMO_USER_EMAIL,
        name: "Demo User",
      },
    });
  }

  return user;
}
