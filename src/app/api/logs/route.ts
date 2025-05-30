// app/api/logs/route.ts (Next.js 13+ app router)
import { NextResponse } from 'next/server';

export async function GET() {
  const API_URL = process.env.API_URL!;
  const API_KEY = process.env.API_KEY!;

  const response = await fetch(API_URL, {
    headers: {
      'x-log-key': API_KEY,
    },
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }

  const data = await response.json();

  return NextResponse.json(data);
}
