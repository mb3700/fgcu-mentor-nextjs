import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const isAuthed = await validateSession(request);
    if (!isAuthed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { mentorId, subject, message } = body;

    if (!mentorId || !subject || !message) {
      return NextResponse.json(
        { error: 'mentorId, subject, and message are required' },
        { status: 400 }
      );
    }

    // Look up the mentor to get their email
    const mentor = await prisma.mentor.findUnique({
      where: { id: mentorId },
    });

    if (!mentor) {
      return NextResponse.json(
        { error: 'Mentor not found' },
        { status: 404 }
      );
    }

    if (!mentor.email) {
      return NextResponse.json(
        { error: 'Mentor does not have an email address on file' },
        { status: 400 }
      );
    }

    // Send the email
    const emailSent = await sendEmail({
      to: mentor.email,
      subject,
      text: message,
    });

    // Create an interaction record regardless of email success
    await prisma.interaction.create({
      data: {
        mentorId: mentor.id,
        type: 'email',
        subject,
        notes: message,
        date: new Date(),
        createdBy: 'admin',
      },
    });

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: 'Email sent and interaction recorded',
      });
    } else {
      return NextResponse.json({
        success: true,
        message: 'Email could not be sent (SMTP not configured), but interaction was recorded',
        emailSent: false,
      });
    }
  } catch (error) {
    console.error('Error contacting mentor:', error);
    return NextResponse.json(
      { error: 'Failed to contact mentor' },
      { status: 500 }
    );
  }
}
