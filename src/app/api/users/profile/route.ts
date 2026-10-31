import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado. Debes iniciar sesión para editar tu perfil.' },
        { status: 401 }
      );
    }

    const sessionUserId = parseInt(session.user.id as string, 10);
    if (isNaN(sessionUserId)) {
      return NextResponse.json(
        { error: 'Sesión no válida. Vuelve a iniciar sesión.' },
        { status: 401 }
      );
    }

    const currentUser = await prisma.usuarios.findUnique({
      where: { id: sessionUserId },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado en la base de datos.' },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    const newUsernameRaw = formData.get('nombre_usuario') as string | null;
    const bioRaw = formData.get('bio') as string | null;
    const avatarFile = formData.get('avatar') as File | null;
    const bannerFile = formData.get('banner') as File | null;

    const dataToUpdate: Record<string, unknown> = {};

    // 1. Manejo y validación de nombre de usuario (Límite estricto de 3 cambios)
    if (newUsernameRaw) {
      const newUsername = newUsernameRaw.trim();

      if (newUsername !== currentUser.nombre_usuario) {
        // Validar formato (permite letras mayúsculas, minúsculas, números, puntos y guiones)
        if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(newUsername)) {
          return NextResponse.json(
            {
              error:
                'El nombre de usuario o artista debe tener entre 3 y 30 caracteres (solo letras, números, puntos y guiones).',
            },
            { status: 400 }
          );
        }

        const currentChanges = Number((currentUser as any).cambios_usuario) || 0;
        if (currentChanges >= 3) {
          return NextResponse.json(
            {
              error:
                'Has alcanzado el límite máximo de 3 cambios de nombre de usuario permitidos.',
            },
            { status: 400 }
          );
        }

        // Verificar si el nuevo nombre ya está ocupado por otro usuario
        const existingUser = await prisma.usuarios.findFirst({
          where: {
            nombre_usuario: newUsername,
            id: { not: sessionUserId },
          },
        });

        if (existingUser) {
          return NextResponse.json(
            {
              error: 'Ese nombre de usuario o artista ya está registrado por otra cuenta.',
            },
            { status: 400 }
          );
        }

        dataToUpdate.nombre_usuario = newUsername;
        dataToUpdate.cambios_usuario = currentChanges + 1;
      }
    }

    // 2. Manejo de biografía
    if (bioRaw !== null) {
      dataToUpdate.bio = bioRaw.trim().slice(0, 500);
    }

    // 3. Subir Foto de Perfil (Avatar) a Cloudinary
    if (avatarFile && avatarFile.size > 0) {
      const MAX_AVATAR_SIZE = 10 * 1024 * 1024; // 10MB
      if (avatarFile.size > MAX_AVATAR_SIZE) {
        return NextResponse.json(
          { error: 'La foto de perfil no debe superar los 10MB.' },
          { status: 400 }
        );
      }

      const avatarBuf = Buffer.from(await avatarFile.arrayBuffer());
      const avatarUpload = await uploadToCloudinary(avatarBuf, {
        folder: 'chojin/profiles',
        public_id: `avatar_${sessionUserId}_${Date.now()}`,
        resource_type: 'image',
      });

      dataToUpdate.foto_perfil = avatarUpload.secure_url;
    }

    // 4. Subir Banner a Cloudinary
    if (bannerFile && bannerFile.size > 0) {
      const MAX_BANNER_SIZE = 15 * 1024 * 1024; // 15MB
      if (bannerFile.size > MAX_BANNER_SIZE) {
        return NextResponse.json(
          { error: 'La imagen de portada / banner no debe superar los 15MB.' },
          { status: 400 }
        );
      }

      const bannerBuf = Buffer.from(await bannerFile.arrayBuffer());
      const bannerUpload = await uploadToCloudinary(bannerBuf, {
        folder: 'chojin/banners',
        public_id: `banner_${sessionUserId}_${Date.now()}`,
        resource_type: 'image',
      });

      dataToUpdate.banner = bannerUpload.secure_url;
    }

    // Guardar cambios si hay datos modificados
    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hubo cambios que guardar.',
        user: {
          id: currentUser.id,
          nombre_usuario: currentUser.nombre_usuario,
          foto_perfil: currentUser.foto_perfil,
          banner: currentUser.banner,
          bio: currentUser.bio,
          cambios_usuario: (currentUser as any).cambios_usuario || 0,
          cambios_restantes: Math.max(0, 3 - ((currentUser as any).cambios_usuario || 0)),
        },
      });
    }

    const updatedUser = await prisma.usuarios.update({
      where: { id: sessionUserId },
      data: dataToUpdate,
    });

    const totalChanges = Number((updatedUser as any).cambios_usuario) || 0;

    return NextResponse.json({
      success: true,
      message: 'Perfil actualizado exitosamente.',
      user: {
        id: updatedUser.id,
        nombre_usuario: updatedUser.nombre_usuario,
        foto_perfil: updatedUser.foto_perfil,
        banner: updatedUser.banner,
        bio: updatedUser.bio,
        cambios_usuario: totalChanges,
        cambios_restantes: Math.max(0, 3 - totalChanges),
      },
    });
  } catch (error: unknown) {
    console.error('Error al actualizar perfil:', error);
    const err = error as Error;
    return NextResponse.json(
      { error: err?.message || 'Error interno al actualizar el perfil.' },
      { status: 500 }
    );
  }
}

export const PUT = POST;
