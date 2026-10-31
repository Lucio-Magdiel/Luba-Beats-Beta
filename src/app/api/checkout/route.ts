import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { compras_licencia } from "@prisma/client";
import { createCulqiCharge } from "@/lib/payment/culqi";

export const dynamic = 'force-dynamic';

interface CheckoutItem {
  beatId: number | string;
  producerId?: number;
  licenseTier: "basic" | "premium" | "exclusive";
  price?: number;
}

// Cálculo canónico del precio de licencias en el servidor
const calculateServerPrice = (
  basePrice: number,
  license: "basic" | "premium" | "exclusive",
  currency: string
): number => {
  let usd = basePrice;
  if (license === "premium") usd = Math.round(basePrice * 2.8);
  if (license === "exclusive") usd = Math.round(basePrice * 12);

  if (currency === "PEN") {
    return Math.round(usd * 3.75);
  }
  return Number(usd.toFixed(2));
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    const {
      items,
      paymentMethod = "Yape",
      currency = "USD",
      guestEmail,
      tokenId,
      antifraudDetails,
    } = body as {
      items: CheckoutItem[];
      paymentMethod?: string;
      currency?: string;
      guestEmail?: string;
      tokenId?: string;
      antifraudDetails?: any;
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "El carrito de compras no contiene productos." },
        { status: 400 }
      );
    }

    // 1. Identificar al comprador
    let buyerId: number;
    let buyerEmail = "";
    let buyerUsername = "";

    if (session?.user?.id) {
      buyerId = parseInt(session.user.id as string, 10);
      buyerEmail = session.user.email || "";
      const buyerUser = await prisma.usuarios.findUnique({
        where: { id: buyerId },
        select: { nombre_usuario: true },
      });
      buyerUsername = buyerUser?.nombre_usuario || session.user.name || "Usuario";
    } else {
      // Comprador invitado con correo dinámico o de fallback
      const cleanEmail =
        guestEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim())
          ? guestEmail.trim().toLowerCase()
          : "invitado@lubabeats.com";

      let guest = await prisma.usuarios.findUnique({
        where: { correo: cleanEmail },
      });

      if (!guest) {
        const baseName = cleanEmail.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "");
        const suffix = Math.floor(1000 + Math.random() * 9000);
        guest = await prisma.usuarios.create({
          data: {
            nombre_usuario: `${baseName || "invitado"}_${suffix}`,
            correo: cleanEmail,
            tipo: "comprador",
            verificado_google: false,
          },
        });
      }
      buyerId = guest.id;
      buyerEmail = guest.correo;
      buyerUsername = guest.nombre_usuario;
    }

    const orderId = `LB-${Math.floor(100000 + Math.random() * 900000)}`;
    const validLicencias: compras_licencia[] = ["basic", "premium", "exclusive"];

    // 2. Fase de verificación previa de ítems y cálculo de total canónico
    const validatedItems: Array<{
      beat: any;
      lic: compras_licencia;
      price: number;
    }> = [];
    let calculatedTotal = 0;

    for (const item of items) {
      const rawId = String(item.beatId);
      const parsedId = parseInt(rawId.replace(/^[^\d]*/, ""), 10);

      if (isNaN(parsedId)) {
        continue;
      }

      const beat = await prisma.beats.findUnique({
        where: { id: parsedId },
        select: {
          id: true,
          id_productor: true,
          titulo: true,
          precio: true,
          estado: true,
          archivo_preview: true,
          archivo_full: true,
          usuarios: {
            select: { id: true, nombre_usuario: true },
          },
        },
      });

      if (!beat) {
        continue;
      }

      if (beat.estado === "privado" || beat.estado === "eliminado") {
        return NextResponse.json(
          { error: `La instrumental "${beat.titulo}" ya fue vendida en exclusiva o no está disponible.` },
          { status: 409 }
        );
      }

      const lic: compras_licencia = validLicencias.includes(item.licenseTier as compras_licencia)
        ? (item.licenseTier as compras_licencia)
        : "basic";

      const basePrice = Number(beat.precio) || 25;
      const officialPrice = calculateServerPrice(basePrice, lic, currency);
      calculatedTotal += officialPrice;

      validatedItems.push({
        beat,
        lic,
        price: officialPrice,
      });
    }

    if (validatedItems.length === 0) {
      return NextResponse.json(
        { error: "Ninguno de los ítems seleccionados se encuentra disponible." },
        { status: 400 }
      );
    }

    // 3. Procesar Cargo con Culqi si viene tokenId o si es método con tarjeta/culqi
    let finalPaymentReference = orderId;
    const isCulqiMethod =
      Boolean(tokenId) ||
      paymentMethod.toLowerCase().includes("culqi") ||
      paymentMethod.toLowerCase().includes("tarjeta");

    if (isCulqiMethod) {
      const chargeResult = await createCulqiCharge({
        amount: calculatedTotal,
        currency: currency === "PEN" ? "PEN" : "USD",
        email: buyerEmail,
        sourceId: tokenId || "tkn_simulated_test",
        description: `Compra de ${validatedItems.length} licencia(s) en Luba Beats`,
        orderId,
        metadata: {
          orderId,
          buyerId: String(buyerId),
          buyerUsername,
        },
        antifraudDetails,
      });

      if (!chargeResult.success) {
        return NextResponse.json(
          {
            error:
              chargeResult.error ||
              "El pago no pudo ser autorizado por la pasarela Culqi.",
          },
          { status: 402 }
        );
      }

      if (chargeResult.chargeId) {
        finalPaymentReference = chargeResult.chargeId;
      }
    }

    // 4. Registrar compras en base de datos una vez autorizado el pago
    const verifiedPurchases: any[] = [];

    for (const validItem of validatedItems) {
      const { beat, lic, price } = validItem;

      const compraRecord = await prisma.compras.create({
        data: {
          id_comprador: buyerId,
          id_beat: beat.id,
          id_productor: beat.id_productor,
          licencia: lic,
          precio: price,
          moneda: currency,
          metodo_pago: paymentMethod,
          referencia_pago: finalPaymentReference,
          estado: "completado",
          fecha_compra: new Date(),
        },
      });

      // Si es licencia exclusiva, retirar de venta inmediatamente
      if (lic === "exclusive") {
        await prisma.beats.update({
          where: { id: beat.id },
          data: { estado: "privado" },
        });
      }

      // Notificar al productor mediante mensaje interno directo
      try {
        const licLabel =
          lic === "exclusive"
            ? "Exclusiva"
            : lic === "premium"
            ? "Premium"
            : "Básica";

        const senderId = buyerId === beat.id_productor ? 1 : buyerId;
        const buyerDisplay = session?.user?.id ? `@${buyerUsername}` : `${buyerUsername} (${buyerEmail})`;

        await prisma.mensajes.create({
          data: {
            id_emisor: senderId,
            id_receptor: beat.id_productor,
            contenido: `🎉 ¡Nueva venta realizada!\n\n${buyerDisplay} acaba de adquirir una Licencia ${licLabel} para tu instrumental "${beat.titulo}" por $${price.toFixed(2)} ${currency}.\n\n📄 Referencia de orden: ${finalPaymentReference}\n💳 Método de pago: ${paymentMethod}\n\nPuedes consultar los detalles completos en tu Panel de Productor -> Historial de Ventas.`,
            leido: false,
            fecha_envio: new Date(),
          },
        });
      } catch (notifErr) {
        console.warn("No se pudo registrar notificación de venta para el productor:", notifErr);
      }

      verifiedPurchases.push({
        compraId: compraRecord.id,
        beatId: beat.id,
        beatTitle: beat.titulo,
        producerName: beat.usuarios.nombre_usuario,
        licencia: lic,
        precio: price,
        downloadUrl: beat.archivo_full || beat.archivo_preview,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Compra verificada y procesada exitosamente.",
      orderId: finalPaymentReference,
      totalAmount: calculatedTotal,
      currency,
      buyerEmail,
      itemsCount: verifiedPurchases.length,
      purchases: verifiedPurchases,
    });
  } catch (error) {
    console.error("Error al procesar compra:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al registrar la compra en el servidor." },
      { status: 500 }
    );
  }
}

// GET: Obtener compras realizadas por el usuario actual o ventas si es productor
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const sessionUserId = parseInt(session.user.id as string, 10);
    const userRole = (session.user as any)?.role;

    if (userRole === "productor" || userRole === "super_admin") {
      // Ventas para el productor
      const salesRecords = await prisma.compras.findMany({
        where: userRole === "super_admin" ? {} : { id_productor: sessionUserId },
        include: {
          beat: {
            select: {
              id: true,
              titulo: true,
              archivo_visual: true,
              archivo_preview: true,
              archivo_full: true,
            },
          },
          comprador: {
            select: {
              id: true,
              nombre_usuario: true,
              correo: true,
              foto_perfil: true,
            },
          },
        },
        orderBy: { id: "desc" },
        take: 50,
      });

      const sales = salesRecords.map((s) => ({
        id: s.id,
        precio: Number(s.precio),
        moneda: s.moneda,
        licencia: s.licencia,
        metodo_pago: s.metodo_pago,
        referencia_pago: s.referencia_pago,
        estado: s.estado,
        fecha_compra: s.fecha_compra,
        beat_id: s.beat.id,
        beat_titulo: s.beat.titulo,
        beat_cover: s.beat.archivo_visual,
        comprador_nombre: s.comprador.nombre_usuario,
        comprador_correo: s.comprador.correo,
      }));

      return NextResponse.json({ sales });
    } else {
      // Compras realizadas por el comprador
      const purchasesRecords = await prisma.compras.findMany({
        where: { id_comprador: sessionUserId },
        include: {
          beat: {
            select: {
              id: true,
              titulo: true,
              archivo_preview: true,
              archivo_full: true,
              archivo_visual: true,
              usuarios: {
                select: {
                  id: true,
                  nombre_usuario: true,
                },
              },
            },
          },
        },
        orderBy: { id: "desc" },
      });

      const purchases = purchasesRecords.map((c) => ({
        id: c.id,
        precio: Number(c.precio),
        moneda: c.moneda,
        licencia: c.licencia,
        metodo_pago: c.metodo_pago,
        referencia_pago: c.referencia_pago,
        estado: c.estado,
        fecha_compra: c.fecha_compra,
        beat_id: c.beat.id,
        beat_titulo: c.beat.titulo,
        archivo_preview: c.beat.archivo_preview,
        archivo_full: c.beat.archivo_full || c.beat.archivo_preview,
        beat_cover: c.beat.archivo_visual,
        productor_nombre: c.beat.usuarios.nombre_usuario,
      }));

      return NextResponse.json({ purchases });
    }
  } catch (error) {
    console.error("Error al obtener compras/ventas:", error);
    return NextResponse.json({ error: "Error del servidor al consultar registros" }, { status: 500 });
  }
}
