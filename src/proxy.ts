import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const authHandler = NextAuth(authConfig).auth;

export default authHandler;
export const proxy = authHandler;

export const config = {
  matcher: [
    "/admin/:path*",
    "/productor/panel/:path*",
    "/artista/panel/:path*",
    "/subir/:path*",
    "/mensajes/:path*",
  ],
};

