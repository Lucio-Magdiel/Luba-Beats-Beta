import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    // El payload de evento de Culqi
    const eventType = rawBody.type || rawBody.event;
    let eventData = rawBody.data;

    // En algunas versiones de Culqi webhook, 'data' puede venir como string JSON
    if (typeof eventData === 'string') {
      try {
        eventData = JSON.parse(eventData);
      } catch {
        // mantener como objeto
      }
    }

    console.log(`[Culqi Webhook] Recibido evento: ${eventType}`, eventData?.id);

    // 1. Manejo de Orden pagada (por ejemplo PagoEfectivo / CIP completado en agente o banco)
    if (eventType === 'order.status.changed' || eventType === 'order.paid') {
      const orderId = eventData?.id;
      const orderState = eventData?.state || eventData?.status;

      if (orderId && orderState === 'paid') {
        console.log(`[Culqi Webhook] Procesando orden pagada: ${orderId}`);

        // Buscar compras asociadas a esta orden
        const comprasPendientes = await prisma.compras.findMany({
          where: {
            referencia_pago: orderId,
            estado: 'pendiente',
          },
          include: {
            beat: true,
            comprador: true,
          },
        });

        for (const compra of comprasPendientes) {
          // 1. Cambiar estado a completado
          await prisma.compras.update({
            where: { id: compra.id },
            data: {
              estado: 'completado',
              fecha_compra: new Date(),
            },
          });

          // 2. Si fue licencia exclusiva, retirar de venta
          if (compra.licencia === 'exclusive') {
            await prisma.beats.update({
              where: { id: compra.id_beat },
              data: { estado: 'privado' },
            });
          }

          // 3. Notificar al productor
          try {
            await prisma.mensajes.create({
              data: {
                id_emisor: compra.id_comprador,
                id_receptor: compra.id_productor,
                contenido: `🎉 ¡Pago de orden confirmado!\n\nSe ha completado el pago de la orden ${orderId} por la instrumental "${compra.beat.titulo}". Los archivos y el contrato han sido liberados al comprador.`,
                leido: false,
                fecha_envio: new Date(),
              },
            });
          } catch (notifErr) {
            console.warn('[Culqi Webhook] Error al notificar productor:', notifErr);
          }
        }
      }
    }

    // 2. Manejo de cargo exitoso (Tarjeta o Yape)
    if (eventType === 'charge.successful' || eventType === 'charge.creation.succeeded') {
      const chargeId = eventData?.id;
      console.log(`[Culqi Webhook] Cargo verificado exitosamente: ${chargeId}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('[Culqi Webhook] Error al procesar:', err);
    return NextResponse.json(
      { error: 'Webhook processing error', details: err?.message },
      { status: 500 }
    );
  }
}

