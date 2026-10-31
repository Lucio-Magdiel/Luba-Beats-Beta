import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

// GET: Obtener mensajes de una conversación o lista de conversaciones
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado. Inicia sesión.' }, { status: 401 });
    }

    const sessionUserId = parseInt(session.user.id as string, 10);
    const { searchParams } = new URL(req.url);
    const withUserIdStr = searchParams.get('withUserId');

    // CASO 1: Obtener mensajes con un usuario específico
    if (withUserIdStr) {
      const withUserId = parseInt(withUserIdStr, 10);
      if (isNaN(withUserId)) {
        return NextResponse.json({ error: 'ID de usuario inválido' }, { status: 400 });
      }

      // Marcar mensajes no leídos enviados por withUserId como leídos
      await prisma.mensajes.updateMany({
        where: {
          id_emisor: withUserId,
          id_receptor: sessionUserId,
          leido: false,
        },
        data: {
          leido: true,
        },
      });

      // Obtener el historial completo ordenado cronológicamente
      const messages = await prisma.mensajes.findMany({
        where: {
          OR: [
            { id_emisor: sessionUserId, id_receptor: withUserId },
            { id_emisor: withUserId, id_receptor: sessionUserId },
          ],
        },
        orderBy: {
          id: 'asc',
        },
        include: {
          emisor: {
            select: {
              id: true,
              nombre_usuario: true,
              foto_perfil: true,
              tipo: true,
            },
          },
          receptor: {
            select: {
              id: true,
              nombre_usuario: true,
              foto_perfil: true,
              tipo: true,
            },
          },
        },
      });

      // Obtener info del otro usuario
      const otherUser = await prisma.usuarios.findUnique({
        where: { id: withUserId },
        select: {
          id: true,
          nombre_usuario: true,
          foto_perfil: true,
          tipo: true,
          verificado_google: true,
        },
      });

      return NextResponse.json({
        messages,
        otherUser,
      });
    }

    // CASO 2: Obtener lista de conversaciones recientes
    // Buscamos todos los mensajes donde participa el usuario
    const allUserMessages = await prisma.mensajes.findMany({
      where: {
        OR: [
          { id_emisor: sessionUserId },
          { id_receptor: sessionUserId },
        ],
      },
      orderBy: {
        id: 'desc',
      },
      include: {
        emisor: {
          select: {
            id: true,
            nombre_usuario: true,
            foto_perfil: true,
            tipo: true,
          },
        },
        receptor: {
          select: {
            id: true,
            nombre_usuario: true,
            foto_perfil: true,
            tipo: true,
          },
        },
      },
    });

    // Agrupar por el otro usuario
    const conversationsMap = new Map<number, any>();

    for (const msg of allUserMessages) {
      const isSender = msg.id_emisor === sessionUserId;
      const otherUser = isSender ? msg.receptor : msg.emisor;
      const otherUserId = otherUser.id;

      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          user: otherUser,
          lastMessage: {
            id: msg.id,
            contenido: msg.contenido,
            fecha_envio: msg.fecha_envio,
            isSender,
            leido: msg.leido,
          },
          unreadCount: 0,
        });
      }

      // Si el mensaje es recibido por mí y no está leído, sumar al contador
      if (!isSender && !msg.leido) {
        const conv = conversationsMap.get(otherUserId);
        conv.unreadCount += 1;
      }
    }

    const conversations = Array.from(conversationsMap.values());

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// POST: Enviar un nuevo mensaje directo
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado. Inicia sesión.' }, { status: 401 });
    }

    const sessionUserId = parseInt(session.user.id as string, 10);
    const body = await req.json();
    const { id_receptor, contenido } = body;

    const receptorId = parseInt(id_receptor, 10);
    const cleanContent = String(contenido || '').trim();

    if (isNaN(receptorId)) {
      return NextResponse.json({ error: 'ID de destinatario no válido' }, { status: 400 });
    }

    if (!cleanContent) {
      return NextResponse.json({ error: 'El mensaje no puede estar vacío' }, { status: 400 });
    }

    if (receptorId === sessionUserId) {
      return NextResponse.json({ error: 'No puedes enviarte mensajes a ti mismo' }, { status: 400 });
    }

    // Verificar que el emisor no esté suspendido
    const senderUser = await prisma.usuarios.findUnique({
      where: { id: sessionUserId },
    });

    if (senderUser?.estado === 'suspendido') {
      return NextResponse.json(
        { error: 'Tu cuenta ha sido suspendida por moderación y no puedes enviar mensajes.' },
        { status: 403 }
      );
    }

    // Verificar que el receptor exista y no esté suspendido
    const targetUser = await prisma.usuarios.findUnique({
      where: { id: receptorId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'El usuario destinatario no existe' }, { status: 404 });
    }

    if (targetUser.estado === 'suspendido') {
      return NextResponse.json(
        { error: 'No es posible enviar mensajes a un usuario con la cuenta suspendida.' },
        { status: 403 }
      );
    }

    // Crear mensaje
    const nuevoMensaje = await prisma.mensajes.create({
      data: {
        id_emisor: sessionUserId,
        id_receptor: receptorId,
        contenido: cleanContent,
        leido: false,
        fecha_envio: new Date(),
      },
      include: {
        emisor: {
          select: {
            id: true,
            nombre_usuario: true,
            foto_perfil: true,
            tipo: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Mensaje enviado exitosamente',
      data: nuevoMensaje,
    }, { status: 201 });
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    return NextResponse.json({ error: 'Error al enviar el mensaje' }, { status: 500 });
  }
}
