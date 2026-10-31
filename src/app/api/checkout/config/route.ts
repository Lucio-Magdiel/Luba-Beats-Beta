import { NextResponse } from 'next/server';
import { getCulqiConfig } from '@/lib/payment/culqi';

export async function GET() {
  const { publicKey, isTest, isConfigured } = getCulqiConfig();

  return NextResponse.json({
    publicKey,
    isTest,
    isConfigured,
    currencyDefault: 'PEN',
  });
}

