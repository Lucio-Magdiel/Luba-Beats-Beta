# 💳 Integración de Pagos para Perú y Latinoamérica

## 🇵🇪 Métodos de Pago Soportados para Perú

### Billeteras Digitales (Prioritarias)
1. **Yape** (BCP) - 80% de penetración en Perú
2. **Plin** (Interbank, BBVA, BanBif, Scotiabank)
3. **Tunki** (Interbank)
4. **Lukita** (BBVA)

### Pagos con Tarjeta
- Visa, Mastercard, American Express
- Tarjetas débito y crédito locales

### Transferencias Bancarias
- BCP
- Interbank
- BBVA
- Scotiabank
- BanBif

### Pagos en Efectivo
- Agentes BCP
- Agentes Interbank
- Kasnet
- Western Union
- Tambo+
- PagoEfectivo

---

## 🏦 Pasarelas de Pago Principales

### 1. Culqi (Recomendado para Perú) ⭐
**¿Por qué Culqi?**
- Empresa peruana, entiende el mercado local
- Integración nativa con Yape, Plin
- Comisión competitiva: 3.59% + S/0.50 por transacción
- Pago en efectivo en múltiples puntos
- Mejor UX para usuarios peruanos

**Métodos soportados:**
- ✅ Yape (QR y link de pago)
- ✅ Plin (QR y link de pago)
- ✅ Tarjetas Visa/Mastercard
- ✅ PagoEfectivo (efectivo en agentes)
- ✅ Transferencias bancarias

**Instalación:**
```bash
pnpm add culqi-node
```

**Configuración:**
```typescript
// lib/payment/culqi.ts
import Culqi from 'culqi-node';

export const culqi = new Culqi({
  publicKey: process.env.CULQI_PUBLIC_KEY!,
  secretKey: process.env.CULQI_SECRET_KEY!,
  env: process.env.NODE_ENV === 'production' ? 'live' : 'test'
});

// Crear cargo con Yape
export async function createYapeCharge(amount: number, email: string) {
  try {
    const charge = await culqi.charges.create({
      amount: amount * 100, // En centavos
      currency_code: 'PEN',
      email: email,
      source_id: 'token_id', // Token desde el frontend
      metadata: {
        method: 'yape'
      }
    });
    
    return {
      success: true,
      chargeId: charge.id,
      qrCode: charge.qr_code_url // URL del QR para Yape
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Crear orden de Pago Efectivo
export async function createCashOrder(amount: number, email: string) {
  const order = await culqi.orders.create({
    amount: amount * 100,
    currency_code: 'PEN',
    description: 'Compra de Beat en Luba Beats',
    order_number: `ORDER-${Date.now()}`,
    client_details: {
      email: email
    },
    expiration_date: Math.floor(Date.now() / 1000) + 86400 // 24 horas
  });
  
  return {
    orderId: order.id,
    paymentCode: order.payment_code, // Código para pagar en agentes
    expirationDate: order.expiration_date
  };
}
```

---

### 2. Mercado Pago (Para toda Latam) 🌎
**¿Por qué Mercado Pago?**
- Presencia en 18 países de Latam
- Múltiples métodos de pago locales
- Protección al comprador y vendedor
- Comisión: 4.99% + impuestos

**Países soportados:**
- 🇦🇷 Argentina (Mercado Pago, Rapipago, PagoFácil)
- 🇧🇷 Brasil (PIX, Boleto Bancário)
- 🇨🇱 Chile (Webpay, Servipag)
- 🇨🇴 Colombia (PSE, Efecty)
- 🇲🇽 México (OXXO, SPEI)
- 🇵🇪 Perú (Yape, PagoEfectivo)
- Y más...

**Instalación:**
```bash
pnpm add mercadopago
```

**Configuración:**
```typescript
// lib/payment/mercadopago.ts
import mercadopago from 'mercadopago';

mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN!
});

export async function createMercadoPagoPreference(
  beatTitle: string,
  amount: number,
  userId: string
) {
  const preference = await mercadopago.preferences.create({
    items: [
      {
        title: beatTitle,
        unit_price: amount,
        quantity: 1,
      }
    ],
    back_urls: {
      success: `${process.env.NEXT_PUBLIC_URL}/payment/success`,
      failure: `${process.env.NEXT_PUBLIC_URL}/payment/failure`,
      pending: `${process.env.NEXT_PUBLIC_URL}/payment/pending`
    },
    auto_return: 'approved',
    external_reference: userId,
    payment_methods: {
      excluded_payment_types: [],
      installments: 1
    },
    notification_url: `${process.env.NEXT_PUBLIC_URL}/api/webhooks/mercadopago`
  });
  
  return preference.body.init_point; // URL de pago
}

// Verificar pago
export async function verifyMercadoPagoPayment(paymentId: string) {
  const payment = await mercadopago.payment.findById(paymentId);
  
  return {
    status: payment.body.status, // approved, pending, rejected
    amount: payment.body.transaction_amount,
    paymentMethod: payment.body.payment_method_id
  };
}
```

---

### 3. Niubiz (Visa Perú) 💳
**¿Por qué Niubiz?**
- Propiedad de Visa
- Mejor para tarjetas de crédito/débito
- Comisión: 3.0% - 3.5%
- Muy usado por empresas grandes en Perú

**Configuración:**
```typescript
// lib/payment/niubiz.ts
export async function createNiubizSession(amount: number) {
  const response = await fetch(
    `${process.env.NIUBIZ_URL}/api.security/v1/security`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NIUBIZ_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        channel: 'web',
        amount: amount,
        antifraud: {
          clientIp: 'IP_ADDRESS',
          merchantDefineData: {
            MDD4: userId,
            MDD21: 0,
            MDD32: userId,
            MDD75: 'Registrado',
            MDD77: 30
          }
        }
      })
    }
  );
  
  const data = await response.json();
  return data.sessionKey;
}
```

---

### 4. Izipay (Grupo Intercorp) 🏪
**¿Por qué Izipay?**
- Del grupo Intercorp (Interbank, Plaza Vea)
- Integración con todo el ecosistema Intercorp
- Pagos recurrentes
- Comisión: 3.5% - 4.0%

**Configuración:**
```typescript
// lib/payment/izipay.ts
import { Izipay } from 'izipay-sdk';

export const izipay = new Izipay({
  username: process.env.IZIPAY_USERNAME!,
  password: process.env.IZIPAY_PASSWORD!,
  endpoint: process.env.NODE_ENV === 'production' 
    ? 'https://api.izipay.pe'
    : 'https://sandbox.izipay.pe'
});

export async function createIzipayPayment(amount: number, email: string) {
  const payment = await izipay.createPayment({
    amount: amount * 100,
    currency: 'PEN',
    orderId: `ORDER-${Date.now()}`,
    customer: {
      email: email
    }
  });
  
  return payment.formToken; // Token para el formulario
}
```

---

### 5. Stripe (Backup Internacional) 🌐
**¿Cuándo usar Stripe?**
- Pagos internacionales
- Clientes fuera de Latam
- Tarjetas internacionales
- Suscripciones

**Comisión:** 3.5% + $0.30 USD

**Configuración:**
```typescript
// lib/payment/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function createStripeCheckout(
  beatId: string,
  amount: number,
  currency: string = 'usd'
) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: currency,
        product_data: {
          name: 'Beat License',
        },
        unit_amount: amount * 100,
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel`,
  });
  
  return session.url;
}
```

---

## 🔄 Arquitectura de Pagos Multi-Provider

### Estructura de Base de Datos (Prisma)

```prisma
// Enums
enum PaymentProvider {
  CULQI
  MERCADO_PAGO
  NIUBIZ
  IZIPAY
  STRIPE
}

enum PaymentMethod {
  YAPE
  PLIN
  CREDIT_CARD
  DEBIT_CARD
  CASH
  BANK_TRANSFER
  MERCADO_PAGO
}

enum PaymentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  REFUNDED
  EXPIRED
}

enum Currency {
  PEN  // Soles peruanos
  USD  // Dólares
  ARS  // Pesos argentinos
  BRL  // Reales brasileños
  CLP  // Pesos chilenos
  COP  // Pesos colombianos
  MXN  // Pesos mexicanos
}

// Modelo de Transacción
model Transaction {
  id                String          @id @default(cuid())
  
  // Relaciones
  userId            String
  user              User            @relation(fields: [userId], references: [id])
  beatId            String
  beat              Beat            @relation(fields: [beatId], references: [id])
  
  // Detalles del pago
  provider          PaymentProvider
  paymentMethod     PaymentMethod
  status            PaymentStatus   @default(PENDING)
  
  // Montos
  amount            Decimal         @db.Decimal(10, 2)
  currency          Currency        @default(PEN)
  amountInUsd       Decimal?        @db.Decimal(10, 2) // Conversión para reportes
  
  // IDs externos
  providerTransactionId String?     @unique
  providerOrderId   String?
  
  // Metadata
  paymentCode       String?         // Para pagos en efectivo
  qrCodeUrl         String?         // Para Yape/Plin
  expiresAt         DateTime?       // Para pagos pendientes
  
  // Información adicional
  ipAddress         String?
  userAgent         String?
  metadata          Json?
  
  // Devoluciones
  refundedAt        DateTime?
  refundReason      String?
  
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  
  @@index([userId])
  @@index([beatId])
  @@index([status])
  @@index([provider])
  @@index([createdAt])
}

// Tabla de tasas de cambio
model ExchangeRate {
  id                String          @id @default(cuid())
  fromCurrency      Currency
  toCurrency        Currency
  rate              Decimal         @db.Decimal(10, 6)
  source            String          // API source
  validFrom         DateTime        @default(now())
  validUntil        DateTime
  
  @@unique([fromCurrency, toCurrency, validFrom])
  @@index([fromCurrency, toCurrency])
}
```

### Service Layer - Payment Factory

```typescript
// lib/payment/payment-factory.ts
import type { PaymentProvider, Currency } from '@prisma/client';

export interface PaymentService {
  createPayment(params: CreatePaymentParams): Promise<PaymentResult>;
  verifyPayment(transactionId: string): Promise<PaymentStatus>;
  refundPayment(transactionId: string): Promise<RefundResult>;
}

export interface CreatePaymentParams {
  amount: number;
  currency: Currency;
  method: PaymentMethod;
  email: string;
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  qrCode?: string;
  paymentCode?: string;
  expiresAt?: Date;
  error?: string;
}

export class PaymentFactory {
  static getService(provider: PaymentProvider): PaymentService {
    switch (provider) {
      case 'CULQI':
        return new CulqiService();
      case 'MERCADO_PAGO':
        return new MercadoPagoService();
      case 'NIUBIZ':
        return new NiubizService();
      case 'IZIPAY':
        return new IzipayService();
      case 'STRIPE':
        return new StripeService();
      default:
        throw new Error(`Provider ${provider} not supported`);
    }
  }
  
  // Seleccionar el mejor provider según país y método
  static selectProvider(
    country: string,
    method: PaymentMethod
  ): PaymentProvider {
    // Perú
    if (country === 'PE') {
      if (method === 'YAPE' || method === 'PLIN') return 'CULQI';
      if (method === 'CASH') return 'CULQI';
      if (method === 'CREDIT_CARD') return 'NIUBIZ';
    }
    
    // Resto de Latam
    if (['AR', 'BR', 'CL', 'CO', 'MX'].includes(country)) {
      return 'MERCADO_PAGO';
    }
    
    // Internacional
    return 'STRIPE';
  }
}
```

### API Route para procesar pagos

```typescript
// app/api/payments/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PaymentFactory } from '@/lib/payment/payment-factory';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { beatId, method, country } = await req.json();
    
    // Obtener beat
    const beat = await prisma.beat.findUnique({
      where: { id: beatId },
      include: { producer: true }
    });
    
    if (!beat) {
      return NextResponse.json({ error: 'Beat not found' }, { status: 404 });
    }
    
    // Seleccionar provider
    const provider = PaymentFactory.selectProvider(country, method);
    const service = PaymentFactory.getService(provider);
    
    // Crear pago
    const result = await service.createPayment({
      amount: Number(beat.price),
      currency: country === 'PE' ? 'PEN' : 'USD',
      method: method,
      email: session.user.email!,
      metadata: {
        beatId: beat.id,
        userId: session.user.id,
        producerId: beat.producerId
      }
    });
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    // Guardar transacción
    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        beatId: beat.id,
        provider: provider,
        paymentMethod: method,
        amount: beat.price,
        currency: country === 'PE' ? 'PEN' : 'USD',
        providerTransactionId: result.transactionId,
        qrCodeUrl: result.qrCode,
        paymentCode: result.paymentCode,
        expiresAt: result.expiresAt,
        status: 'PENDING'
      }
    });
    
    return NextResponse.json({
      success: true,
      transactionId: transaction.id,
      paymentUrl: result.paymentUrl,
      qrCode: result.qrCode,
      paymentCode: result.paymentCode
    });
    
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 🎨 Componentes UI para Pagos

### Selector de Método de Pago

```typescript
// components/checkout/payment-method-selector.tsx
'use client'

import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Image from 'next/image';

const PAYMENT_METHODS_PE = [
  {
    id: 'yape',
    name: 'Yape',
    description: 'Paga con tu app Yape',
    icon: '/icons/yape.svg',
    popular: true
  },
  {
    id: 'plin',
    name: 'Plin',
    description: 'Paga con tu app Plin',
    icon: '/icons/plin.svg',
    popular: true
  },
  {
    id: 'card',
    name: 'Tarjeta',
    description: 'Visa, Mastercard, American Express',
    icon: '/icons/cards.svg'
  },
  {
    id: 'cash',
    name: 'Efectivo',
    description: 'Paga en agentes autorizados',
    icon: '/icons/cash.svg'
  }
];

export function PaymentMethodSelector({ onSelect }) {
  const [selected, setSelected] = useState('yape');
  
  return (
    <RadioGroup value={selected} onValueChange={(value) => {
      setSelected(value);
      onSelect(value);
    }}>
      <div className="grid gap-3">
        {PAYMENT_METHODS_PE.map((method) => (
          <label
            key={method.id}
            className="relative flex items-center gap-4 rounded-lg border p-4 cursor-pointer hover:bg-accent"
          >
            <RadioGroupItem value={method.id} />
            <Image
              src={method.icon}
              alt={method.name}
              width={40}
              height={40}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{method.name}</span>
                {method.popular && (
                  <span className="text-xs bg-primary text-white px-2 py-0.5 rounded">
                    Popular
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {method.description}
              </p>
            </div>
          </label>
        ))}
      </div>
    </RadioGroup>
  );
}
```

---

## 📱 Flujo de Pago con Yape

```typescript
// components/checkout/yape-payment.tsx
'use client'

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export function YapePayment({ amount, transactionId }) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  
  const initiatePayment = async () => {
    const response = await fetch('/api/payments/yape', {
      method: 'POST',
      body: JSON.stringify({ transactionId, amount })
    });
    
    const data = await response.json();
    setQrCode(data.qrCodeUrl);
    
    // Polling para verificar el pago
    checkPaymentStatus();
  };
  
  const checkPaymentStatus = async () => {
    setChecking(true);
    const interval = setInterval(async () => {
      const response = await fetch(`/api/payments/verify/${transactionId}`);
      const data = await response.json();
      
      if (data.status === 'COMPLETED') {
        clearInterval(interval);
        window.location.href = '/payment/success';
      }
    }, 3000); // Check cada 3 segundos
  };
  
  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <h3 className="text-2xl font-bold">Pagar con Yape</h3>
      <p className="text-center text-muted-foreground">
        Escanea el código QR con tu app Yape
      </p>
      
      {qrCode ? (
        <>
          <QRCodeSVG value={qrCode} size={256} />
          <div className="flex items-center gap-2 text-sm">
            {checking && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Esperando confirmación del pago...</span>
          </div>
        </>
      ) : (
        <Button onClick={initiatePayment} size="lg">
          Generar QR de Yape
        </Button>
      )}
      
      <p className="text-xs text-center text-muted-foreground max-w-sm">
        El código QR es válido por 10 minutos. 
        Después de pagar, la confirmación puede tardar hasta 2 minutos.
      </p>
    </div>
  );
}
```

---

## ✅ Checklist de Implementación

### Configuración Inicial
- [ ] Crear cuentas en Culqi, Mercado Pago
- [ ] Obtener API keys de producción y sandbox
- [ ] Configurar webhooks en cada plataforma
- [ ] Configurar dominios autorizados

### Desarrollo
- [ ] Implementar servicios de cada provider
- [ ] Crear factory para selección automática
- [ ] Diseñar UI de checkout
- [ ] Implementar QR para Yape/Plin
- [ ] Sistema de verificación de pagos
- [ ] Manejo de expiración de pagos pendientes

### Testing
- [ ] Probar cada método de pago en sandbox
- [ ] Probar webhooks
- [ ] Probar conversión de monedas
- [ ] Stress testing de transacciones concurrentes

### Legal y Compliance
- [ ] Términos y condiciones de venta
- [ ] Política de reembolsos
- [ ] Cumplimiento PCI-DSS (no guardar datos de tarjetas)
- [ ] Facturación electrónica (SUNAT para Perú)

---

## 💰 Comparación de Comisiones

| Proveedor | Comisión | Retiro | Mejor para |
|-----------|----------|--------|------------|
| **Culqi** | 3.59% + S/0.50 | Gratis | Perú (Yape/Plin) |
| **Mercado Pago** | 4.99% | 2.5% | Latam |
| **Niubiz** | 3.0% - 3.5% | Gratis | Tarjetas PE |
| **Izipay** | 3.5% - 4.0% | Gratis | Empresas grandes |
| **Stripe** | 3.5% + $0.30 | Gratis | Internacional |

**Recomendación:** Usar Culqi como principal para Perú y Mercado Pago para el resto de Latam.

---

## 🚀 Próximos Pasos

1. Instalar dependencias: `pnpm install`
2. Configurar variables de entorno
3. Crear cuentas en pasarelas
4. Implementar primer método (Yape con Culqi)
5. Testing en sandbox
6. Lanzamiento gradual

**¿Listo para empezar? 🎵💳**
