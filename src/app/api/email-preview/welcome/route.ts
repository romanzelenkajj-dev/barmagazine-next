import { NextResponse } from 'next/server';
import { WELCOME_EMAIL_HTML } from '@/lib/emails/welcome';

export async function GET() {
  return new NextResponse(WELCOME_EMAIL_HTML, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
