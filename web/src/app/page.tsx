import { prisma } from "@/lib/prisma";

export default async function Home() {
  // Simple smoke test for Phase 0 — confirms Prisma/Postgres wiring works.
  const userCount = await prisma.user.count();

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>Miraj CV</h1>
      <p>Phase 0 scaffold is running.</p>
      <p>Users in DB: {userCount}</p>
      <p>Next up: Phase 1 — profile builder UI.</p>
    </main>
  );
}
