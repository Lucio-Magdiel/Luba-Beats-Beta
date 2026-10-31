import Culqi from 'culqi-node';

/**
 * Entorno y llaves de Culqi
 */
export function getCulqiConfig() {
  let secretKey =
    process.env.CULQI_SECRET_KEY ||
    process.env.CULQI_SECRET_KEY_TEST ||
    '';

  let publicKey =
    process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY ||
    process.env.CULQI_PUBLIC_KEY_TEST ||
    '';

  // Si la variable de entorno en Vercel tiene el placeholder de plantilla o está vacía, usar las llaves reales de Magdiel
  if (!secretKey || secretKey.includes('tu_llave') || secretKey.includes('xxxxxxxx')) {
    secretKey = 'sk_test_eqPzpP5TXhgMtX9F';
  }

  if (!publicKey || publicKey.includes('tu_llave') || publicKey.includes('xxxxxxxx')) {
    publicKey = 'pk_test_ijtlipA73AniJvki';
  }

  const isTest = secretKey.startsWith('sk_test_') || publicKey.startsWith('pk_test_');
  const isConfigured = Boolean(secretKey && !secretKey.includes('tu_llave') && !secretKey.includes('xxxxxxxx'));

  return {
    secretKey,
    publicKey,
    isTest,
    isConfigured,
  };
}

/**
 * Cliente singleton de Culqi para el backend
 */
let culqiInstance: any = null;

export function getCulqiClient() {
  const { secretKey, isConfigured } = getCulqiConfig();

  if (!isConfigured) {
    throw new Error('Culqi no está configurado. Por favor define CULQI_SECRET_KEY en tu archivo .env');
  }

  if (!culqiInstance) {
    // Maneja compatibilidad bundler (ESM / CJS)
    const CulqiConstructor = (Culqi as any).default || Culqi;
    culqiInstance = new CulqiConstructor({
      privateKey: secretKey,
    });
  }

  return culqiInstance;
}

export interface CreateChargeOptions {
  amount: number; // Monto en Soles o Dólares (ej. 25.00)
  currency: 'PEN' | 'USD';
  email: string;
  sourceId: string; // Token de tarjeta 'tkn_...' o token de Yape
  description: string;
  orderId?: string;
  metadata?: Record<string, string>;
  antifraudDetails?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    city?: string;
    countryCode?: string;
  };
}

export interface CulqiChargeResult {
  success: boolean;
  chargeId?: string;
  referenceCode?: string;
  message?: string;
  outcome?: any;
  error?: string;
  raw?: any;
}

/**
 * Crear un Cargo inmediato (Tarjeta o Yape) en Culqi
 */
export async function createCulqiCharge(options: CreateChargeOptions): Promise<CulqiChargeResult> {
  const { isConfigured } = getCulqiConfig();

  // Si no está configurada la llave secreta, devolvemos un cargo simulado para desarrollo
  if (!isConfigured) {
    console.warn('[Culqi] Modo de prueba simulado activo (sin CULQI_SECRET_KEY configurada)');
    return {
      success: true,
      chargeId: `cch_mock_${Date.now()}`,
      referenceCode: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      message: 'Cargo simulado aprobado exitosamente (Modo Sandbox Local)',
    };
  }

  try {
    const culqi = getCulqiClient();

    // Culqi requiere el monto en céntimos como string o número entero
    const amountInCents = Math.round(options.amount * 100);

    const chargePayload: any = {
      amount: String(amountInCents),
      currency_code: options.currency,
      email: options.email,
      source_id: options.sourceId,
      description: options.description || 'Compra en Luba Beats Marketplace',
      metadata: {
        plataforma: 'Luba Beats',
        ...options.metadata,
      },
    };

    if (options.antifraudDetails) {
      chargePayload.antifraud_details = {
        first_name: options.antifraudDetails.firstName || 'Usuario',
        last_name: options.antifraudDetails.lastName || 'Luba',
        phone: options.antifraudDetails.phone || '999999999',
        address: options.antifraudDetails.address || 'Lima',
        address_city: options.antifraudDetails.city || 'Lima',
        country_code: options.antifraudDetails.countryCode || 'PE',
      };
    }

    const charge = await culqi.charges.createCharge(chargePayload);

    // Culqi devuelve objeto con outcome
    const isPaid = charge.paid || charge.outcome?.type === 'venta_exitosa';

    if (isPaid) {
      return {
        success: true,
        chargeId: charge.id,
        referenceCode: charge.reference_code,
        outcome: charge.outcome,
        message: charge.outcome?.user_message || 'Transacción autorizada con éxito.',
        raw: charge,
      };
    }

    return {
      success: false,
      chargeId: charge.id,
      error: charge.outcome?.user_message || 'La transacción no pudo ser autorizada.',
      outcome: charge.outcome,
      raw: charge,
    };
  } catch (err: any) {
    console.error('[Culqi] Error al crear cargo:', err);
    const friendlyError =
      err?.user_message ||
      err?.merchant_message ||
      err?.message ||
      'Ocurrió un error al procesar el pago con Culqi.';
    return {
      success: false,
      error: friendlyError,
      raw: err,
    };
  }
}

export interface CreateOrderOptions {
  amount: number;
  currency: 'PEN' | 'USD';
  description: string;
  orderNumber: string;
  clientDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  expirationHours?: number;
}

export interface CulqiOrderResult {
  success: boolean;
  orderId?: string;
  paymentCode?: string; // Código CIP para PagoEfectivo / Agentes
  expirationDate?: number;
  error?: string;
  raw?: any;
}

/**
 * Crear una Orden para PagoEfectivo (CIP) o Culqi Checkout v4
 */
export async function createCulqiOrder(options: CreateOrderOptions): Promise<CulqiOrderResult> {
  const { isConfigured } = getCulqiConfig();

  if (!isConfigured) {
    return {
      success: true,
      orderId: `ord_mock_${Date.now()}`,
      paymentCode: `CIP-${Math.floor(1000000 + Math.random() * 9000000)}`,
      expirationDate: Math.floor(Date.now() / 1000) + 86400,
    };
  }

  try {
    const culqi = getCulqiClient();
    const amountInCents = Math.round(options.amount * 100);
    const expirationHours = options.expirationHours || 24;
    const expirationDate = Math.floor(Date.now() / 1000) + expirationHours * 3600;

    const orderPayload = {
      amount: amountInCents,
      currency_code: options.currency,
      description: options.description || 'Orden de compra Luba Beats',
      order_number: options.orderNumber,
      client_details: {
        first_name: options.clientDetails.firstName || 'Cliente',
        last_name: options.clientDetails.lastName || 'Luba',
        email: options.clientDetails.email,
        phone_number: options.clientDetails.phone || '999999999',
      },
      expiration_date: expirationDate,
    };

    const order = await culqi.orders.createOrder(orderPayload);

    return {
      success: true,
      orderId: order.id,
      paymentCode: order.payment_code,
      expirationDate: order.expiration_date,
      raw: order,
    };
  } catch (err: any) {
    console.error('[Culqi] Error al crear orden:', err);
    return {
      success: false,
      error:
        err?.user_message ||
        err?.merchant_message ||
        err?.message ||
        'No se pudo generar la orden de Culqi.',
      raw: err,
    };
  }
}
