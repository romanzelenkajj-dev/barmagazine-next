import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Send email notification via a simple mailto-style approach
    // For production, you'd use a service like Resend, SendGrid, etc.
    // For now, we log the submission (it's already saved in Supabase)
    console.log('New bar submission:', data);

    // Could integrate with email service here later
    // For now, the submission is saved to Supabase bar_submissions table

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
