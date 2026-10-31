import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const compras = await prisma.compras.findMany({
      orderBy: { id: 'desc' },
      take: 10,
      include: {
        beat: { select: { id: true, titulo: true, precio: true } },
        comprador: { select: { id: true, nombre_usuario: true, correo: true } },
      },
    });

    return NextResponse.json({ success: true, count: compras.length, compras });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
