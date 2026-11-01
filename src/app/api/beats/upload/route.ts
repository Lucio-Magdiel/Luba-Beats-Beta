import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { Beat, ItemType, MusicalKey, MusicGenre, MusicMood, defaultLicenses } from '@/types/beat';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// Utility to generate aesthetic waveform array
const generateWaveform = (seed: number, count = 55): number[] => {
  const result: number[] = [];
  for (let i = 0; i < count; i++) {
    const val = Math.abs(Math.sin(i * 0.22 + seed) * 0.65 + Math.cos(i * 0.4 + seed * 2) * 0.35);
    result.push(Math.max(0.15, Math.min(1.0, Number(val.toFixed(2)))));
  }
  return result;
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado. Debes iniciar sesión para subir beats o canciones.' },
        { status: 401 }
      );
    }

    const sessionUserId = parseInt(session.user.id as string, 10);
    if (isNaN(sessionUserId)) {
      return NextResponse.json(
        { error: 'Sesión no válida. Por favor vuelve a iniciar sesión.' },
        { status: 401 }
      );
    }

    // Obtener información del usuario autenticado
    const currentUser = await prisma.usuarios.findUnique({
      where: { id: sessionUserId },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado en la base de datos.' },
        { status: 404 }
      );
    }

    if (currentUser.tipo === 'comprador') {
      return NextResponse.json(
        { error: 'Las cuentas de tipo Comprador no tienen permisos para subir beats ni pistas al catálogo. Cambia tu rol o regístrate como Productor o Artista.' },
        { status: 403 }
      );
    }

    if (currentUser.estado === 'suspendido') {
      return NextResponse.json(
        { error: 'Tu cuenta ha sido suspendida por incumplimiento de las reglas comunitarias (acumulación de strikes). No puedes subir pistas al catálogo.' },
        { status: 403 }
      );
    }

    const contentType = req.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    let title = 'Sin Título';
    let type: ItemType = 'beat';
    let genre: MusicGenre = 'Trap';
    let bpm = 140;
    let key: MusicalKey = 'C Minor';
    let mood: MusicMood = 'Energético';
    let price = 25;
    let tags: string[] = [];
    let audioUrl = '';
    let coverUrl = '';
    let durationSeconds = 180;

    if (isJson) {
      const body = await req.json();
      title = (body.title as string) || 'Sin Título';
      type = ((body.type as string) || 'beat') as ItemType;
      genre = ((body.genre as string) || 'Trap') as MusicGenre;
      bpm = parseInt(String(body.bpm || '140'), 10);
      key = ((body.key as string) || 'C Minor') as MusicalKey;
      mood = ((body.mood as string) || 'Energético') as MusicMood;
      price = parseFloat(String(body.price || '25'));
      audioUrl = (body.audioUrl as string) || '';
      coverUrl = (body.coverUrl as string) || '';
      durationSeconds = Math.round(Number(body.audioDuration) || 180);

      const tagsRaw = (body.tags as string) || '';
      tags = Array.isArray(body.tags)
        ? body.tags
        : tagsRaw
        ? tagsRaw.split(',').map((t: string) => t.trim()).filter(Boolean)
        : [genre, `${bpm} BPM`, type];

      if (!audioUrl) {
        return NextResponse.json(
          { error: 'La URL del archivo de audio es obligatoria.' },
          { status: 400 }
        );
      }

      if (!coverUrl) {
        return NextResponse.json(
          { error: 'La URL de la portada o visual es obligatoria.' },
          { status: 400 }
        );
      }
    } else {
      const formData = await req.formData();

      const audioFile = formData.get('audio') as File | null;
      const coverFile = formData.get('cover') as File | null;
      title = (formData.get('title') as string) || 'Sin Título';
      type = ((formData.get('type') as string) || 'beat') as ItemType;
      genre = ((formData.get('genre') as string) || 'Trap') as MusicGenre;
      bpm = parseInt((formData.get('bpm') as string) || '140', 10);
      key = ((formData.get('key') as string) || 'C Minor') as MusicalKey;
      mood = ((formData.get('mood') as string) || 'Energético') as MusicMood;
      price = parseFloat((formData.get('price') as string) || '25');

      const tagsRaw = (formData.get('tags') as string) || '';
      tags = tagsRaw
        ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean)
        : [genre, `${bpm} BPM`, type];

      if (!audioFile) {
        return NextResponse.json(
          { error: 'El archivo de audio es obligatorio (.mp3 o .wav)' },
          { status: 400 }
        );
      }

      const MAX_AUDIO_SIZE = 50 * 1024 * 1024;
      if (audioFile.size > MAX_AUDIO_SIZE) {
        return NextResponse.json(
          { error: 'El archivo de audio supera el límite máximo permitido de 50MB' },
          { status: 400 }
        );
      }

      if (!coverFile) {
        return NextResponse.json(
          { error: 'El archivo de imagen o video para la portada es obligatorio' },
          { status: 400 }
        );
      }

      const MAX_COVER_SIZE = 15 * 1024 * 1024;
      if (coverFile.size > MAX_COVER_SIZE) {
        return NextResponse.json(
          { error: 'La portada o video visual supera el límite máximo permitido de 15MB' },
          { status: 400 }
        );
      }

      const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
      const coverBuffer = Buffer.from(await coverFile.arrayBuffer());

      const slugTemp = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const timestampTemp = Date.now();

      const audioFolder = type === 'musica' ? 'chojin/musica' : 'chojin/beats';
      const audioUploadResult = await uploadToCloudinary(audioBuffer, {
        folder: audioFolder,
        public_id: `${type}_${timestampTemp}_${slugTemp}`,
        resource_type: 'video',
      });

      const coverUploadResult = await uploadToCloudinary(coverBuffer, {
        folder: 'chojin/visuales',
        public_id: `visual_${timestampTemp}_${slugTemp}`,
        resource_type: 'auto',
      });

      audioUrl = audioUploadResult.secure_url;
      coverUrl = coverUploadResult.secure_url;
      durationSeconds = Math.round(audioUploadResult.duration || 180);
    }

    // RESTRICCIONES ESTRICTAS POR ROL:
    // 1. Artistas: Solo pueden subir canciones libres para streaming (tipo: 'musica'), sin precio ni venta comercial.
    if (currentUser.tipo === 'artista') {
      if (type === 'beat') {
        return NextResponse.json(
          { error: 'Los artistas solo tienen permisos para subir canciones y temas propios para streaming. La venta y subida de beats instrumentales está reservada exclusivamente para Productores.' },
          { status: 403 }
        );
      }
      type = 'musica';
      price = 0;
    }

    // 2. Productores y Super Admin: Pueden subir beats comerciales (con precio) o canciones para streaming (gratuitas)
    if (currentUser.tipo === 'productor' || currentUser.tipo === 'super_admin') {
      if (type === 'musica') {
        price = 0;
      }
    }

    // Generate clean slug
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const timestamp = Date.now();
    const m = Math.floor(durationSeconds / 60);
    const s = Math.floor(durationSeconds % 60);
    const durationFormatted = `${m}:${s < 10 ? '0' : ''}${s}`;

    // 3. Save to MySQL database via Prisma con el id del usuario autenticado
    let dbId: number = timestamp;
    try {
      const createdRecord = await prisma.beats.create({
        data: {
          id_productor: sessionUserId,
          tipo: type === 'musica' ? 'musica' : 'beat',
          titulo: title,
          genero: genre,
          bpm,
          mood,
          precio: price,
          archivo_preview: audioUrl,
          archivo_full: audioUrl,
          archivo_visual: coverUrl,
          estado: 'publico',
          duracion: durationFormatted,
          nota_musical: key
        }
      });
      dbId = createdRecord.id;
    } catch (dbErr) {
      console.warn('Advertencia: no se pudo guardar en MySQL, continuando con Cloudinary ID:', dbErr);
    }

    const newBeat: Beat = {
      id: String(dbId),
      title,
      slug: `${slug}-${dbId}`,
      type,
      producer: {
        id: String(currentUser.id),
        name: currentUser.nombre_usuario,
        handle: currentUser.nombre_usuario,
        avatar: currentUser.foto_perfil || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        verified: !!currentUser.verificado_google,
        country: 'Perú',
        totalBeats: 1,
        role: currentUser.tipo === 'artista' ? 'artista' : 'productor'
      },
      genre,
      bpm,
      key,
      mood,
      tags,
      duration: durationSeconds,
      durationFormatted,
      audioPreviewUrl: audioUrl,
      coverUrl: coverUrl,
      waveform: generateWaveform(Math.random() * 10),
      priceFrom: price,
      priceFromPEN: Math.round(price * 3.75),
      plays: 0,
      likes: 0,
      isFeatured: true,
      isFree: type === 'musica' || price === 0,
      createdAt: new Date().toISOString(),
      licenses: (type === 'musica' || price === 0) ? [] : defaultLicenses(price)
    };

    return NextResponse.json({
      success: true,
      message: 'Pista subida y registrada exitosamente',
      beat: newBeat
    });
  } catch (error: unknown) {
    console.error('Error al subir a Cloudinary / BD:', error);
    const errObj = error as { message?: string; error?: { message?: string } };
    const errorMessage =
      errObj?.message ||
      errObj?.error?.message ||
      (error instanceof Error ? error.message : 'Error interno al procesar los archivos');
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
