import { NextResponse } from 'next/server';
import { DATA_BACKEND } from '@/lib/backend';

/** Healthcheck (Route Handler). GET /api/health */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'neon-ledger',
    backend: DATA_BACKEND,
    time: new Date().toISOString(),
  });
}
