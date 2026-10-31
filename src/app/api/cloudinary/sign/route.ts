import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { signUploadParams } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado. Debes iniciar sesión para subir archivos.' },
        { status: 401 }
      );
    }

    const sessionUserId = parseInt(session.user.id as string, 10);
    if (isNaN(sessionUserId)) {
      return NextResponse.json(
        { error: 'Sesión no válida.' },
        { status: 401 }
      );
    }

    const currentUser = await prisma.usuarios.findUnique({
      where: { id: sessionUserId },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado.' },
        { status: 404 }
      );
    }

    if (currentUser.estado === 'suspendido') {
      return NextResponse.json(
        { error: 'Tu cuenta ha sido suspendida por acumulación de strikes.' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const rawFolder = String(body.folder || 'chojin/beats');
    
    // Whitelist valid folders for uploads
    const ALLOWED_FOLDERS = [
      'chojin/beats',
      'chojin/musica',
      'chojin/visuales',
      'chojin/usuarios',
      'chojin/profiles',
      'chojin/banners'
    ];
    const folder = ALLOWED_FOLDERS.includes(rawFolder) ? rawFolder : 'chojin/beats';

    if (currentUser.tipo === 'comprador' && (folder === 'chojin/beats' || folder === 'chojin/musica')) {
      return NextResponse.json(
        { error: 'Las cuentas Comprador no tienen permisos para subir beats ni canciones.' },
        { status: 403 }
      );
    }

    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign = {
      folder,
      timestamp,
    };

    const signature = signUploadParams(paramsToSign);

    return NextResponse.json({
      signature,
      timestamp,
      folder,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    });
  } catch (error) {
    console.error('Error al generar firma de Cloudinary:', error);
    return NextResponse.json(
      { error: 'Error interno al generar credenciales seguras de subida.' },
      { status: 500 }
    );
  }
}
