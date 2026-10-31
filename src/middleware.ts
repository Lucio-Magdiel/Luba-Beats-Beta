import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/admin/:path*",
    "/productor/panel/:path*",
    "/artista/panel/:path*",
    "/subir/:path*",
    "/mensajes/:path*",
  ],
};
