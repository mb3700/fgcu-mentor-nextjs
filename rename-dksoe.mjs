import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
  // Find all mentors with 'DKSOE Students' in their programs
  const mentors = await prisma.mentor.findMany({
    where: { programs: { has: 'DKSOE Students' } },
    select: { id: true, programs: true },
  });

  console.log(`Found ${mentors.length} mentors with "DKSOE Students"`);

  for (const mentor of mentors) {
    const updated = mentor.programs.map((p) =>
      p === 'DKSOE Students' ? 'Unassigned' : p
    );
    await prisma.mentor.update({
      where: { id: mentor.id },
      data: { programs: updated },
    });
  }

  console.log(`Renamed "DKSOE Students" → "Unassigned" for ${mentors.length} mentors`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
