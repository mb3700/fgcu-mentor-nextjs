import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';
import { revalidateAll } from '@/lib/revalidate';
import { parseExcelFile } from '@/lib/excel';

export async function POST(request: NextRequest) {
  try {
    const isAuthed = await validateSession(request);
    if (!isAuthed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const confirm = searchParams.get('confirm') === 'true';

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const parsedMentors = parseExcelFile(buffer);

    if (parsedMentors.length === 0) {
      return NextResponse.json(
        { error: 'No valid mentor records found in file' },
        { status: 400 }
      );
    }

    // If confirm is not set, return the parsed preview
    if (!confirm) {
      return NextResponse.json({
        preview: true,
        count: parsedMentors.length,
        mentors: parsedMentors,
      });
    }

    // If confirm is set, delete all existing mentors and insert parsed data
    await prisma.mentor.deleteMany();

    const created = await prisma.mentor.createMany({
      data: parsedMentors.map((m) => ({
        name: m.name,
        status: m.status,
        businessName: m.businessName,
        title: m.title,
        location: m.location,
        phone: m.phone,
        email: m.email,
        biography: m.biography,
        fgcuAlumni: m.fgcuAlumni,
        domainExpertise: m.domainExpertise,
        sectorExpertise: m.sectorExpertise,
        programs: m.programs,
        workStatus: m.workStatus,
        potentialSpeaker: m.potentialSpeaker,
        potentialJudge: m.potentialJudge,
        mentorCoordinator: m.mentorCoordinator,
        veteranStatus: m.veteranStatus,
      })),
    });

    revalidateAll();
    return NextResponse.json({
      success: true,
      imported: created.count,
    });
  } catch (error) {
    console.error('Error importing mentors:', error);
    return NextResponse.json(
      { error: 'Failed to import mentors' },
      { status: 500 }
    );
  }
}
