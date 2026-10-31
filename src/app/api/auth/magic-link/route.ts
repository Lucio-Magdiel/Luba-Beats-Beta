import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
      return NextResponse.json(
        { error: "Por favor proporciona un correo electrónico válido" },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Comprobar si el usuario existe, o crear uno temporal como comprador
    let user = await prisma.usuarios.findUnique({
      where: { correo: cleanEmail },
    });

    if (!user) {
      // Si no existe, crear usuario automático con rol 'comprador'
      const baseUsername = cleanEmail.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "");
      const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
      const generatedUsername = `${baseUsername || "user"}_${uniqueSuffix}`;

      user = await prisma.usuarios.create({
        data: {
          correo: cleanEmail,
          nombre_usuario: generatedUsername,
          tipo: "comprador",
          verificado_google: false,
        },
      });
    }

    // Generar token criptográfico aleatorio seguro de 32 bytes (64 caracteres hex)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // Guardar en tabla magic_links
    await prisma.magic_links.create({
      data: {
        email: cleanEmail,
        token: token,
        expires_at: expiresAt,
        created_at: new Date(),
      },
    });

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const magicLinkUrl = `${protocol}://${host}/auth/verify?token=${token}`;

    const isDev = process.env.NODE_ENV !== "production";

    console.log(`[MAGIC LINK GENERADO] Para: ${cleanEmail} -> ${magicLinkUrl}`);

    return NextResponse.json({
      message: "Enlace mágico generado exitosamente. Si la cuenta existe, se ha enviado un enlace de acceso.",
      ...(isDev ? { magicLink: magicLinkUrl, isDev: true } : {}),
      expiresAt: expiresAt.toISOString(),
      email: cleanEmail,
    });
  } catch (error) {
    console.error("Error al generar magic link:", error);
    return NextResponse.json(
      { error: "No se pudo generar el enlace de acceso" },
      { status: 500 }
    );
  }
}
