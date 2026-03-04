import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Honeypot check — if the hidden field has a value, silently reject
    if (body.website) {
      return NextResponse.json({ success: true, message: 'Application submitted successfully' });
    }

    // Validate required fields
    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!body.email?.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email.trim())) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    const mentor = await prisma.mentor.create({
      data: {
        name: body.name.trim(),
        status: 'Pending Approval',
        businessName: body.businessName?.trim() || null,
        title: body.title?.trim() || null,
        location: body.location?.trim() || null,
        phone: body.phone?.trim() || null,
        email: body.email.trim(),
        biography: body.biography?.trim() || null,
        fgcuAlumni: body.fgcuAlumni || false,
        domainExpertise: body.domainExpertise || [],
        sectorExpertise: body.sectorExpertise || [],
        programs: body.programs || [],
        workStatus: body.workStatus || null,
        potentialSpeaker: body.potentialSpeaker || false,
        potentialJudge: body.potentialJudge || false,
        mentorCoordinator: null,
        veteranStatus: body.veteranStatus || false,
        photoUrl: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      id: mentor.id,
    });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: 'Failed to submit application. Please try again.' },
      { status: 500 }
    );
  }
}
