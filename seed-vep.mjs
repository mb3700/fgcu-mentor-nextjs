import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================
// Veterans Florida Entrepreneurship Program (VEP) Seed Script
// ============================================================
// Creates VEP participants (mentors, speakers, judges) and
// workshops from McKenna's spreadsheet data.
// Participants are NOT assigned to workshops — McKenna will
// assign them via the admin interface.
// ============================================================

const VEP_MENTORS = [
  { firstName: 'Kena', lastName: 'Yoke', email: 'kena@islandpiling.com', roleDetail: 'Class Mentor & Strategic Advisor for Program Beyond Mentoring' },
  { firstName: 'Gonzalo', lastName: 'Paternoster', email: 'gonzalo4life@gmail.com', roleDetail: 'Class Mentor & Strategic Advisor for Program Beyond Mentoring' },
  { firstName: 'Bruce', lastName: 'Bacon', email: 'BruceBacon7@gmail.com', roleDetail: '1:1 Mentor (Outside of Class) for Veteran Participant' },
  { firstName: 'Becky', lastName: 'Sharon', email: 'becky@beckysharonbrainhealth.com', roleDetail: 'Class Mentor' },
  { firstName: 'Michael', lastName: 'Schneider', email: 'michael@schneider-christians.com', roleDetail: 'Class Mentor' },
  { firstName: 'Jim', lastName: 'Kahl', email: 'callkahl@aol.com', roleDetail: 'Class Mentor' },
  { firstName: 'Pat', lastName: 'Sullivan', email: 'psullivan@molrix.net', roleDetail: 'Class Mentor' },
];

const VEP_SPEAKERS = [
  { firstName: 'Scott', lastName: 'Spitzer', email: 'scottlspitzer@gmail.com', roleDetail: 'Class Speaker' },
  { firstName: 'Webb', lastName: 'Cheshire', email: 'jcheshire@fgcu.edu', roleDetail: 'Class Speaker' },
  { firstName: 'Agelo', lastName: 'Biasi', email: 'abiasi@solvably.com', roleDetail: 'Class Speaker' },
  { firstName: 'Greg', lastName: 'Desrosiers', email: 'gdesrosiers@fgcu.edu', roleDetail: 'Class Speaker' },
  { firstName: 'Scott', lastName: 'Houston', email: 'scott@scotthouston.com', roleDetail: 'Class Speaker' },
  { firstName: 'Jason', lastName: 'Lortie', email: 'jlortie@fgcu.edu', roleDetail: 'Class Speaker' },
  { firstName: 'Scott', lastName: 'Kelly', email: 'smkelly@fgcu.edu', roleDetail: 'Class Speaker' },
  { firstName: 'Ashleigh', lastName: 'Droz', email: 'adroz@fgcu.edu', roleDetail: 'Class Speaker' },
  { firstName: 'Fredrick', lastName: 'Ross', email: 'fross@fgcu.edu', roleDetail: 'Class Speaker' },
];

const VEP_JUDGES = [
  { firstName: 'Dillon', lastName: 'Rosenthal', email: 'drosenthal8835@eagle.fgcu.edu', roleDetail: 'Judge' },
  { firstName: 'Sylvia', lastName: 'Mitchell', email: 'smitchell@fgcu.edu', roleDetail: 'Judge' },
  { firstName: 'John', lastName: 'Lack', email: 'jlack@fgcu.edu', roleDetail: 'Judge' },
  { firstName: 'Troy', lastName: 'Bolivar', email: 'troy@SWFLINC.COM', roleDetail: 'Judge' },
];

const VEP_WORKSHOPS = [
  { date: '2026-03-17T09:00:00', topic: 'Strategic Partnerships & Expansion Planning' },
  { date: '2026-03-24T09:00:00', topic: 'Government Contracting & Procurement' },
  { date: '2026-03-31T09:00:00', topic: 'Metrics, KPIs, and Performance Management' },
  { date: '2026-04-07T09:00:00', topic: 'Funding: Investors, Loans & Grants' },
  { date: '2026-04-14T09:00:00', topic: 'Pitch Preparation, Scaling Plan Review, Completion' },
  { date: '2026-04-21T09:00:00', topic: 'Final Presentations to Panel' },
];

async function main() {
  console.log('🟢 Starting VEP seed...\n');

  // Step 1: Clean up existing VEP data (for re-runnability)
  console.log('Step 1: Cleaning up existing VEP data...');
  await prisma.vepWorkshopAssignment.deleteMany({});
  await prisma.vepWorkshop.deleteMany({});
  await prisma.vepParticipant.deleteMany({});
  console.log('  Cleared existing VEP data.\n');

  // Step 2: Build mentor lookup map for linking
  console.log('Step 2: Building mentor lookup map...');
  const allMentors = await prisma.mentor.findMany();
  const mentorMap = new Map();
  for (const m of allMentors) {
    // Normalize: lowercase, trim, remove tabs
    const key = m.name.toLowerCase().replace(/\t/g, ' ').trim();
    mentorMap.set(key, m.id);
  }
  console.log(`  Found ${allMentors.length} mentors in database.\n`);

  // Step 3: Create VEP Participants
  console.log('Step 3: Creating VEP participants...');

  const createParticipants = async (participants, role) => {
    let created = 0;
    for (const p of participants) {
      const fullName = `${p.firstName} ${p.lastName}`.toLowerCase().trim();
      // Try to find a matching mentor in the database
      let mentorId = mentorMap.get(fullName) || null;

      // Try partial match for names that might differ slightly
      if (!mentorId) {
        for (const [key, id] of mentorMap.entries()) {
          if (key.includes(p.lastName.toLowerCase()) && key.includes(p.firstName.toLowerCase())) {
            mentorId = id;
            break;
          }
        }
      }

      await prisma.vepParticipant.create({
        data: {
          firstName: p.firstName,
          lastName: p.lastName,
          email: p.email,
          role,
          roleDetail: p.roleDetail,
          mentorId,
        },
      });

      const linkedStr = mentorId ? ` → linked to Mentor #${mentorId}` : '';
      console.log(`  ✅ ${p.firstName} ${p.lastName} (${role})${linkedStr}`);
      created++;
    }
    return created;
  };

  const mentorCount = await createParticipants(VEP_MENTORS, 'mentor');
  const speakerCount = await createParticipants(VEP_SPEAKERS, 'speaker');
  const judgeCount = await createParticipants(VEP_JUDGES, 'judge');

  console.log(`\n  Total participants: ${mentorCount + speakerCount + judgeCount}`);
  console.log(`    Mentors: ${mentorCount}`);
  console.log(`    Speakers: ${speakerCount}`);
  console.log(`    Judges: ${judgeCount}\n`);

  // Step 4: Create VEP Workshops
  console.log('Step 4: Creating VEP workshops...');
  for (const w of VEP_WORKSHOPS) {
    const workshop = await prisma.vepWorkshop.create({
      data: {
        date: new Date(w.date),
        topic: w.topic,
        semester: 'Spring 2026',
      },
    });

    const dateStr = new Date(w.date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    console.log(`  📅 ${dateStr}: ${workshop.topic}`);
  }

  // Summary
  const participantCount = await prisma.vepParticipant.count();
  const workshopCount = await prisma.vepWorkshop.count();
  const linkedCount = await prisma.vepParticipant.count({ where: { mentorId: { not: null } } });

  console.log(`\n✅ VEP seed complete!`);
  console.log(`   Participants: ${participantCount} (${linkedCount} linked to Mentor profiles)`);
  console.log(`   Workshops: ${workshopCount}`);
  console.log(`   Assignments: 0 (McKenna will assign via admin UI)`);
}

main()
  .catch((e) => {
    console.error('❌ VEP seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
