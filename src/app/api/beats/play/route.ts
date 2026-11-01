import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawId = body?.beatId || body?.id;

    if (!rawId) {
      return NextResponse.json(
        { error: 'ID de beat requerido para registrar reproducción' },
        { status: 400 }
      );
    }

    const cleanId = parseInt(String(rawId).replace(/^[^\d]*/, ''), 10);
    if (isNaN(cleanId) || cleanId <= 0) {
      return NextResponse.json(
        { error: 'ID de beat inválido' },
        { status: 400 }
      );
    }

    // Asegurar que la columna existe en PostgreSQL dinámicamente sin fallos
    try {
      await prisma.$executeRawUnsafe(
        `ALTER TABLE beats ADD COLUMN IF NOT EXISTS reproducciones INT DEFAULT 0;`
      );
    } catch (colErr) {
      // Ignorar si ya existe
    }

    // Incrementar atómicamente el contador de reproducciones / vistas
    await prisma.$executeRawUnsafe(
      `UPDATE beats SET reproducciones = COALESCE(reproducciones, 0) + 1 WHERE id = $1;`,
      cleanId
    );

    // Obtener el conteo actualizado
    const result: Array<{ reproducciones: number | null }> = await prisma.$queryRawUnsafe(
      `SELECT reproducciones FROM beats WHERE id = $1 LIMIT 1;`,
      cleanId
    );

    const plays = result[0]?.reproducciones ?? 1;

    return NextResponse.json({
      success: true,
      beatId: cleanId,
      plays,
    });
  } catch (err: any) {
    console.error('[API Play] Error al registrar reproducción:', err);
    return NextResponse.json(
      { error: 'No se pudo actualizar el contador de vistas' },
      { status: 500 }
    );
  }
}

