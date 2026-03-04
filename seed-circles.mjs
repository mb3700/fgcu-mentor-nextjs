import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================
// Mentor Circles Seed Script — Spring 2026
// ============================================================
// Creates circles, sessions, and attendee assignments from
// the schedule provided by Peter Bergeron's email.
// ============================================================

// New mentors NOT in the database — will be created as stubs
const NEW_MENTORS = [
  { name: 'Lauren Leslie' },
  { name: 'Will Buno' },
  { name: 'Bud Stoddard' },
  { name: 'Vito Marco Penza, Esq.' },
  { name: 'Tony Guiliano' },
  { name: 'Ashleigh Droz' },
  { name: 'Steve Lapham' },
  { name: 'Crystie Ciriello' },
  { name: 'Dr. Floyd Quinn' },  // Different person from Fred Quinn
];

// Circle definitions with their sessions and mentor assignments
const CIRCLES = [
  {
    name: 'Thursday Circle',
    coordinator: 'Peter Bergeron',
    dayOfWeek: 'Thursday',
    startTime: '12:00 PM',
    endTime: '1:15 PM',
    semester: 'Spring 2026',
    sessions: [
      {
        date: '2026-03-12T12:00:00',
        mentors: ['Lauren Leslie', 'Fred Quinn', 'Bill Motzer', 'Michael Horowitz', 'Katherine Waddell', 'Karen Mosteller'],
      },
      {
        date: '2026-03-26T12:00:00',
        mentors: ['Lauren Leslie', 'Becky Sharon', 'Fred Quinn', 'Bill Motzer', 'Michael Horowitz', 'Kena Yoke'],
      },
      {
        date: '2026-04-16T12:00:00',
        mentors: ['Lauren Leslie', 'Becky Sharon', 'Fred Quinn', 'Bill Motzer', 'Michael Horowitz', 'Katherine Waddell'],
      },
    ],
  },
  {
    name: 'Friday Circle',
    coordinator: 'Peter Bergeron',
    dayOfWeek: 'Friday',
    startTime: '10:30 AM',
    endTime: '11:45 AM',
    semester: 'Spring 2026',
    sessions: [
      {
        date: '2026-02-27T10:30:00',
        mentors: ['Bill Motzer', 'Katherine Waddell', 'Will Buno', 'Jay Brown', 'Bud Stoddard', 'Vito Marco Penza, Esq.', 'Erv Pesek'],
      },
      {
        date: '2026-03-27T10:30:00',
        mentors: ['Bill Motzer', 'Erv Pesek', 'Katherine Waddell', 'Will Buno', 'Jay Brown', 'Karen Mosteller', 'Dr. Floyd Quinn'],
      },
      {
        date: '2026-04-17T10:30:00',
        mentors: ['Bill Motzer', 'Erv Pesek', 'Kena Yoke', 'Katherine Waddell', 'Will Buno', 'Jay Brown', 'Bud Stoddard'],
      },
    ],
  },
  {
    name: 'Tuesday Circle',
    coordinator: 'Kristoffer Doura',
    dayOfWeek: 'Tuesday',
    startTime: '9:00 AM',
    endTime: '10:15 AM',
    semester: 'Spring 2026',
    sessions: [
      {
        date: '2026-03-17T09:00:00',
        mentors: ['Ron Sidman', 'Rod Ely', 'Bill Motzer', 'Tony Guiliano', 'Ashleigh Droz', 'Steve Lapham'],
      },
      {
        date: '2026-03-31T09:00:00',
        notes: "Tony Guiliano's birthday!",
        mentors: ['Ron Sidman', 'Rod Ely', 'Bill Motzer', 'Ashleigh Droz', 'Tony Guiliano', 'Steve Lapham'],
      },
      {
        date: '2026-04-14T09:00:00',
        mentors: ['Ron Sidman', 'Rod Ely', 'Bill Motzer', 'Steve Lapham', 'Crystie Ciriello', 'Katherine Waddell'],
      },
    ],
  },
];

async function main() {
  console.log('🔵 Starting Mentor Circles seed...\n');

  // Step 1: Fix tab characters in existing mentor names
  console.log('Step 1: Fixing tab characters in mentor names...');
  const allMentors = await prisma.mentor.findMany();
  for (const mentor of allMentors) {
    if (mentor.name.includes('\t')) {
      const fixedName = mentor.name.replace(/\t/g, ' ').trim();
      await prisma.mentor.update({
        where: { id: mentor.id },
        data: { name: fixedName },
      });
      console.log(`  Fixed: "${mentor.name}" → "${fixedName}"`);
    }
  }

  // Step 2: Create new mentor stub records
  console.log('\nStep 2: Creating new mentor records...');
  for (const newMentor of NEW_MENTORS) {
    const existing = await prisma.mentor.findFirst({
      where: { name: { equals: newMentor.name, mode: 'insensitive' } },
    });
    if (existing) {
      console.log(`  Already exists: ${newMentor.name} (id: ${existing.id})`);
    } else {
      const created = await prisma.mentor.create({
        data: {
          name: newMentor.name,
          status: 'Available',
        },
      });
      console.log(`  Created: ${newMentor.name} (id: ${created.id})`);
    }
  }

  // Step 3: Build name → id lookup map
  console.log('\nStep 3: Building mentor lookup map...');
  const mentorList = await prisma.mentor.findMany();
  const mentorMap = new Map();
  for (const m of mentorList) {
    mentorMap.set(m.name.toLowerCase().trim(), m.id);
  }

  // Step 4: Create circles, sessions, and attendees
  console.log('\nStep 4: Creating circles and sessions...');
  for (const circleData of CIRCLES) {
    // Delete existing circle with same name and semester (for re-runnability)
    await prisma.mentorCircle.deleteMany({
      where: { name: circleData.name, semester: circleData.semester },
    });

    const circle = await prisma.mentorCircle.create({
      data: {
        name: circleData.name,
        coordinator: circleData.coordinator,
        dayOfWeek: circleData.dayOfWeek,
        startTime: circleData.startTime,
        endTime: circleData.endTime,
        semester: circleData.semester,
      },
    });
    console.log(`\n  📅 Created circle: ${circle.name} (${circle.coordinator}, ${circle.dayOfWeek}s)`);

    for (const sessionData of circleData.sessions) {
      const session = await prisma.circleSession.create({
        data: {
          circleId: circle.id,
          date: new Date(sessionData.date),
          notes: sessionData.notes || null,
        },
      });

      const dateStr = new Date(sessionData.date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      console.log(`    Session: ${dateStr}`);

      // Assign mentors
      const attendeeData = [];
      for (const mentorName of sessionData.mentors) {
        const mentorId = mentorMap.get(mentorName.toLowerCase().trim());
        if (mentorId) {
          attendeeData.push({
            sessionId: session.id,
            mentorId,
            status: 'scheduled',
          });
        } else {
          console.log(`    ⚠️  Mentor not found: "${mentorName}"`);
        }
      }

      if (attendeeData.length > 0) {
        await prisma.sessionAttendee.createMany({ data: attendeeData });
        console.log(`      Assigned ${attendeeData.length} mentors`);
      }
    }
  }

  // Summary
  const circleCount = await prisma.mentorCircle.count();
  const sessionCount = await prisma.circleSession.count();
  const attendeeCount = await prisma.sessionAttendee.count();
  console.log(`\n✅ Seed complete!`);
  console.log(`   Circles: ${circleCount}`);
  console.log(`   Sessions: ${sessionCount}`);
  console.log(`   Attendee assignments: ${attendeeCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
