import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos Luba Beats...');

  const passwordHash = await bcrypt.hash('123456', 12);

  // 1. Crear Super Admin
  const admin = await prisma.usuarios.upsert({
    where: { correo: 'admin@lubabeats.com' },
    update: {},
    create: {
      nombre_usuario: 'superadmin',
      correo: 'admin@lubabeats.com',
      contrasena: passwordHash,
      tipo: 'super_admin',
      foto_perfil: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      bio: 'Administrador general y soporte de Luba Beats.',
      verificado_google: true,
    },
  });

  // 2. Crear Productor Principal (Chojin)
  const chojin = await prisma.usuarios.upsert({
    where: { correo: 'chojin@lubabeats.com' },
    update: {},
    create: {
      nombre_usuario: 'chojin',
      correo: 'chojin@lubabeats.com',
      contrasena: passwordHash,
      tipo: 'productor',
      foto_perfil: 'https://res.cloudinary.com/dacq9spfd/image/upload/v1761544297/chojin/profiles/profile_2.png',
      banner: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1600&auto=format&fit=crop&q=80',
      bio: 'Beatmaker & Productor musical profesional en Perú. Trap, Drill y Reggaeton moderno.',
      verificado_google: true,
    },
  });

  // 3. Crear Artista Demo
  const artista = await prisma.usuarios.upsert({
    where: { correo: 'artista@lubabeats.com' },
    update: {},
    create: {
      nombre_usuario: 'artista_demo',
      correo: 'artista@lubabeats.com',
      contrasena: passwordHash,
      tipo: 'artista',
      foto_perfil: 'https://res.cloudinary.com/dacq9spfd/image/upload/v1761710807/chojin/profiles/profile_10.jpg',
      banner: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1600&auto=format&fit=crop&q=80',
      bio: 'Cantante y compositor urbano. Lanzamientos oficiales y colaboraciones.',
      verificado_google: true,
    },
  });

  // 4. Crear Comprador Demo
  const comprador = await prisma.usuarios.upsert({
    where: { correo: 'comprador@lubabeats.com' },
    update: {},
    create: {
      nombre_usuario: 'comprador_demo',
      correo: 'comprador@lubabeats.com',
      contrasena: passwordHash,
      tipo: 'comprador',
      foto_perfil: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
      bio: 'Amante de la música urbana y comprador de licencias para proyectos.',
      verificado_google: false,
    },
  });

  console.log('✅ Usuarios creados/verificados:', {
    admin: admin.nombre_usuario,
    productor: chojin.nombre_usuario,
    artista: artista.nombre_usuario,
    comprador: comprador.nombre_usuario,
  });

  // 5. Crear Beats Iniciales de demostración
  const initialBeats = [
    {
      id_productor: chojin.id,
      tipo: 'beat' as const,
      titulo: 'Mongo de B',
      genero: 'Trap',
      bpm: 140,
      mood: 'Energético',
      precio: 25.0,
      archivo_preview: 'https://res.cloudinary.com/dacq9spfd/video/upload/v1761695053/chojin/beats/beat_1761694896_Mongo%20de%20B.mp3',
      archivo_full: 'https://res.cloudinary.com/dacq9spfd/video/upload/v1761695053/chojin/beats/beat_1761694896_Mongo%20de%20B.mp3',
      archivo_visual: 'https://res.cloudinary.com/dacq9spfd/image/upload/v1761695055/chojin/visuales/beat_visual_1761694896_Mongo%20de%20B.jpg',
      estado: 'publico' as const,
      duracion: '3:10',
      nota_musical: 'F Minor',
    },
    {
      id_productor: chojin.id,
      tipo: 'beat' as const,
      titulo: 'Diamantes',
      genero: 'Drill',
      bpm: 142,
      mood: 'Oscuro (Dark)',
      precio: 35.0,
      archivo_preview: 'https://res.cloudinary.com/dacq9spfd/video/upload/v1761629585/chojin/beats/beat_3_1761629422.wav',
      archivo_full: 'https://res.cloudinary.com/dacq9spfd/video/upload/v1761629585/chojin/beats/beat_3_1761629422.wav',
      archivo_visual: 'https://res.cloudinary.com/dacq9spfd/image/upload/v1761629589/chojin/visuales/beat_visual_3_1761629437.jpg',
      estado: 'publico' as const,
      duracion: '3:05',
      nota_musical: 'C# Minor',
    },
    {
      id_productor: artista.id,
      tipo: 'musica' as const,
      titulo: 'Noche en Lima',
      genero: 'Reggaeton',
      bpm: 96,
      mood: 'Romántico',
      precio: 0.0,
      archivo_preview: 'https://res.cloudinary.com/dacq9spfd/video/upload/v1761544297/chojin/beats/beat_1.wav',
      archivo_full: 'https://res.cloudinary.com/dacq9spfd/video/upload/v1761544297/chojin/beats/beat_1.wav',
      archivo_visual: 'https://res.cloudinary.com/dacq9spfd/image/upload/v1761544297/chojin/covers/cover_1.jpg',
      estado: 'publico' as const,
      duracion: '3:20',
      nota_musical: 'A Minor',
    },
  ];

  for (const b of initialBeats) {
    const existing = await prisma.beats.findFirst({
      where: { titulo: b.titulo, id_productor: b.id_productor },
    });
    if (!existing) {
      await prisma.beats.create({ data: b });
      console.log(`🎶 Beat creado: ${b.titulo}`);
    }
  }

  console.log('🎉 Seed completado exitosamente.');
  console.log('Credenciales de prueba creadas (contraseña para todos: 123456):');
  console.log(' - Admin: admin@lubabeats.com');
  console.log(' - Productor: chojin@lubabeats.com');
  console.log(' - Artista: artista@lubabeats.com');
  console.log(' - Comprador: comprador@lubabeats.com');
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
