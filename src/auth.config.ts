import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role =
        (auth?.user as { role?: string })?.role ||
        (auth as unknown as { token?: { role?: string } })?.token?.role;
      const { pathname } = nextUrl;

      // Rutas que requieren inicio de sesión obligatorio
      const isProtected =
        pathname.startsWith("/subir") ||
        pathname.startsWith("/mensajes") ||
        pathname.startsWith("/admin") ||
        pathname.startsWith("/productor/panel") ||
        pathname.startsWith("/artista/panel") ||
        pathname.startsWith("/compras");

      if (isProtected && !isLoggedIn) {
        return false;
      }

      // Restricción por roles conocidos
      if (pathname.startsWith("/admin") && role && role !== "super_admin") {
        return Response.redirect(new URL("/", nextUrl));
      }

      if (pathname.startsWith("/subir") && role === "comprador") {
        return Response.redirect(new URL("/#catalogo", nextUrl));
      }

      if (
        pathname.startsWith("/productor/panel") &&
        role &&
        role !== "productor" &&
        role !== "super_admin"
      ) {
        return Response.redirect(new URL("/#catalogo", nextUrl));
      }

      if (
        pathname.startsWith("/artista/panel") &&
        role &&
        role !== "artista" &&
        role !== "super_admin"
      ) {
        return Response.redirect(new URL("/#catalogo", nextUrl));
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.name = user.name;
        token.nombre_usuario = (user as unknown as { nombre_usuario?: string }).nombre_usuario || user.name;
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
  providers: [],
} satisfies NextAuthConfig;
