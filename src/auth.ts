import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    Credentials({
      name: "Credenciales",
      credentials: {
        identificador: { label: "Correo o Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
        magicToken: { label: "Token Mágico", type: "text" },
      },
      async authorize(credentials) {
        // Caso 1: Ingreso por Magic Link
        if (credentials?.magicToken) {
          const mToken = String(credentials.magicToken).trim();
          const magicRecord = await prisma.magic_links.findUnique({
            where: { token: mToken },
          });

          if (
            !magicRecord ||
            magicRecord.used_at !== null ||
            new Date(magicRecord.expires_at) < new Date()
          ) {
            return null;
          }

          // Invalidar el token marcando used_at
          await prisma.magic_links.update({
            where: { id: magicRecord.id },
            data: { used_at: new Date() },
          });

          // Obtener usuario
          const magicUser = await prisma.usuarios.findUnique({
            where: { correo: magicRecord.email },
          });

          if (!magicUser) return null;

          if (magicUser.estado === 'suspendido') {
            console.warn(`Intento de acceso con cuenta suspendida: ${magicUser.correo}`);
            return null;
          }

          return {
            id: String(magicUser.id),
            name: magicUser.nombre_usuario,
            email: magicUser.correo,
            image: magicUser.foto_perfil,
            role: magicUser.tipo,
          };
        }

        // Caso 2: Ingreso tradicional con identificador y contraseña
        if (!credentials?.identificador || !credentials?.password) {
          return null;
        }

        const idStr = String(credentials.identificador).trim();
        const passStr = String(credentials.password);

        try {
          // Buscar por correo o nombre_usuario
          const user = await prisma.usuarios.findFirst({
            where: {
              OR: [
                { correo: idStr },
                { nombre_usuario: idStr },
              ],
            },
          });

          if (!user || !user.contrasena) {
            return null;
          }

          // Compatibilidad con hashes de PHP / CodeIgniter ($2y$ -> $2a$)
          const normalizedHash = user.contrasena.replace(/^\$2y\$/, "$2a$");
          const isValid = await bcrypt.compare(passStr, normalizedHash);

          if (!isValid) {
            return null;
          }

          if (user.estado === 'suspendido') {
            console.warn(`Intento de login con cuenta suspendida: ${user.correo}`);
            return null;
          }

          return {
            id: String(user.id),
            name: user.nombre_usuario,
            email: user.correo,
            image: user.foto_perfil,
            role: user.tipo,
          };
        } catch (error) {
          console.error("Error en authorize de NextAuth:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) {
          return false;
        }
        const cleanEmail = user.email.toLowerCase().trim();

        try {
          let dbUser = await prisma.usuarios.findUnique({
            where: { correo: cleanEmail },
          });

          if (!dbUser) {
            // Generar nombre de usuario único y válido
            const rawBase = (user.name || cleanEmail.split("@")[0])
              .toLowerCase()
              .replace(/[^a-z0-9_]/g, "_")
              .slice(0, 20);
            const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
            const finalUsername = `${rawBase || "user"}_${uniqueSuffix}`;

            dbUser = await prisma.usuarios.create({
              data: {
                correo: cleanEmail,
                nombre_usuario: finalUsername,
                tipo: "comprador",
                foto_perfil: user.image || null,
                verificado_google: true,
              },
            });
          } else if (!dbUser.verificado_google) {
            await prisma.usuarios.update({
              where: { id: dbUser.id },
              data: { verificado_google: true },
            });
          }

          if (dbUser.estado === 'suspendido') {
            console.warn(`Intento de login con Google en cuenta suspendida: ${cleanEmail}`);
            return false;
          }

          // Asignar los datos del usuario en la base de datos
          user.id = String(dbUser.id);
          (user as any).role = dbUser.tipo;
          (user as any).nombre_usuario = dbUser.nombre_usuario;
          user.name = dbUser.nombre_usuario;
          return true;
        } catch (error) {
          console.error("Error al sincronizar usuario de Google en MySQL:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.name = user.name;
        token.nombre_usuario = (user as any).nombre_usuario || user.name;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id as string) || session.user.id;
        (session.user as unknown as Record<string, unknown>).role = token.role;
        (session.user as unknown as Record<string, unknown>).nombre_usuario = token.nombre_usuario || token.name;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
});
