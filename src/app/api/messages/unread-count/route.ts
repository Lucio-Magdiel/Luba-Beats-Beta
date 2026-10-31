import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ unreadCount: 0 });
    }

    const sessionUserId = parseInt(session.user.id as string, 10);
    const unreadCount = await prisma.mensajes.count({
      where: {
        id_receptor: sessionUserId,
        leido: false,
      },
    });

    return NextResponse.json({ unreadCount });
  } catch (error) {
    console.error('Error al contar no leídos:', error);
    return NextResponse.json({ unreadCount: 0 });
  }
}
