import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { createCulqiOrder } from '@/lib/payment/culqi';
import { compras_licencia } from '@prisma/client';

export const dynamic = 'force-dynamic';

const calculateServerPrice = (
  basePrice: number,
  license: 'basic' | 'premium' | 'exclusive',
  currency: string
): number => {
  let usd = basePrice;
  if (license === 'premium') usd = Math.round(basePrice * 2.8);
  if (license === 'exclusive') usd = Math.round(basePrice * 12);

  if (currency === 'PEN') {
    return Math.round(usd * 3.75);
  }
  return Number(usd.toFixed(2));
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    const { items, currency = 'PEN', guestEmail, guestPhone, guestName } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'El carrito no contiene productos válidos.' },
        { status: 400 }
      );
    }

    // Identificar comprador
    let buyerEmail = session?.user?.email || guestEmail || 'cliente@lubabeats.com';
    let buyerName = session?.user?.name || guestName || 'Cliente Luba';

    // Calcular monto total seguro en el servidor
    let totalAmount = 0;
    const validLicencias: compras_licencia[] = ['basic', 'premium', 'exclusive'];

    for (const item of items) {
      const rawId = String(item.beatId);
      const parsedId = parseInt(rawId.replace(/^[^\d]*/, ''), 10);
      if (isNaN(parsedId)) continue;

      const beat = await prisma.beats.findUnique({
        where: { id: parsedId },
        select: { precio: true, estado: true },
      });

      if (!beat || beat.estado === 'privado' || beat.estado === 'eliminado') {
        continue;
      }

      const lic = validLicencias.includes(item.licenseTier) ? item.licenseTier : 'basic';
      const basePrice = Number(beat.precio) || 25;
      totalAmount += calculateServerPrice(basePrice, lic, currency);
    }

    if (totalAmount <= 0) {
      return NextResponse.json(
        { error: 'No fue posible calcular el monto total de la orden.' },
        { status: 400 }
      );
    }

    const orderNumber = `ORD-${Date.now().toString().slice(-8)}`;

    const orderResult = await createCulqiOrder({
      amount: totalAmount,
      currency: currency === 'PEN' ? 'PEN' : 'USD',
      description: `Compra de ${items.length} licencia(s) en Luba Beats`,
      orderNumber,
      clientDetails: {
        firstName: buyerName.split(' ')[0] || 'Cliente',
        lastName: buyerName.split(' ').slice(1).join(' ') || 'Luba',
        email: buyerEmail,
        phone: guestPhone || '999888777',
      },
      expirationHours: 48,
    });

    if (!orderResult.success) {
      return NextResponse.json(
        { error: orderResult.error || 'No se pudo generar la orden de pago en Culqi.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: orderResult.orderId,
      paymentCode: orderResult.paymentCode,
      expirationDate: orderResult.expirationDate,
      totalAmount,
      currency,
      orderNumber,
    });
  } catch (error: any) {
    console.error('[Culqi Order API] Error:', error);
    return NextResponse.json(
      { error: 'Error interno al generar orden de pago.' },
      { status: 500 }
    );
  }
}
