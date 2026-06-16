// ============================================================
// GET /api/models
// Returns the list of available free models.
// ============================================================

import { NextResponse } from 'next/server';
import { FREE_MODELS } from '@/lib/constants';

export async function GET(): Promise<Response> {
  return NextResponse.json({ models: FREE_MODELS });
}
