import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { usuarios_tipo } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nombre_usuario, correo, contrasena, tipo } = body;

    // Validaciones básicas
    if (!nombre_usuario || !correo || !contrasena) {
      return NextResponse.json(
        { error: "Todos los campos obligatorios deben completarse" },
        { status: 400 }
      );
    }

    const cleanUsername = String(nombre_usuario).trim();
    const cleanEmail = String(correo).trim().toLowerCase();

    // Validar formato de usuario o nombre de artista (permite mayúsculas y minúsculas)
    if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(cleanUsername)) {
      return NextResponse.json(
        {
          error:
            "El nombre de usuario o artista debe tener entre 3 y 30 caracteres (letras, números, puntos y guiones)",
        },
        { status: 400 }
      );
    }

    // Validar formato de correo
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json(
        { error: "El correo electrónico ingresado no es válido" },
        { status: 400 }
      );
    }

    // Validar longitud de contraseña
    if (String(contrasena).length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Validar tipo de usuario
    const validRoles: usuarios_tipo[] = [
      usuarios_tipo.comprador,
      usuarios_tipo.productor,
      usuarios_tipo.artista,
    ];
    const userRole: usuarios_tipo = validRoles.includes(tipo)
      ? tipo
      : usuarios_tipo.comprador;

    // Verificar si ya existe usuario o correo
    const existingUser = await prisma.usuarios.findFirst({
      where: {
        OR: [{ nombre_usuario: cleanUsername }, { correo: cleanEmail }],
      },
    });

    if (existingUser) {
      if (existingUser.correo.toLowerCase() === cleanEmail) {
        return NextResponse.json(
          { error: "Ya existe una cuenta registrada con este correo electrónico" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Este nombre de usuario ya está en uso. Por favor elige otro" },
        { status: 409 }
      );
    }

    // Hashear contraseña con bcrypt (cost 12 según especificación)
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(contrasena, salt);

    // Crear usuario en base de datos
    const nuevoUsuario = await prisma.usuarios.create({
      data: {
        nombre_usuario: cleanUsername,
        correo: cleanEmail,
        contrasena: hashedPassword,
        tipo: userRole,
        verificado_google: false,
      },
      select: {
        id: true,
        nombre_usuario: true,
        correo: true,
        tipo: true,
        foto_perfil: true,
        fecha_registro: true,
      },
    });

    return NextResponse.json(
      {
        message: "Cuenta creada exitosamente",
        user: nuevoUsuario,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return NextResponse.json(
      { error: "Ocurrió un error inesperado al procesar el registro" },
      { status: 500 }
    );
  }
}
