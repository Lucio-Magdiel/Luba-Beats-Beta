'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import {
  X,
  CheckCircle2,
  Download,
  QrCode,
  CreditCard,
  Smartphone,
  ShieldCheck,
  FileText,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  Building2,
} from 'lucide-react';
import { useCartStore, SimulatedOrderReceipt } from '@/store/useCartStore';

type PaymentMethodType = 'Tarjeta (Culqi)' | 'Yape' | 'Plin' | 'PagoEfectivo' | 'Mercado Pago';

interface CulqiConfigResponse {
  publicKey: string;
  isTest: boolean;
  isConfigured: boolean;
  currencyDefault: string;
}

declare global {
  interface Window {
    Culqi?: any;
    culqi?: () => void;
  }
}

export const CheckoutSimModal: React.FC = () => {
  const {
    isCheckoutModalOpen,
    setIsCheckoutModalOpen,
    items,
    getTotalUSD,
    getTotalPEN,
    clearCart,
    receipt,
    setReceipt,
  } = useCartStore();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('Tarjeta (Culqi)');
  const [currency, setCurrency] = useState<'PEN' | 'USD'>('PEN');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [culqiConfig, setCulqiConfig] = useState<CulqiConfigResponse | null>(null);
  const [isCulqiScriptLoaded, setIsCulqiScriptLoaded] = useState(false);

  // PagoEfectivo / CIP state
  const [cipData, setCipData] = useState<{
    paymentCode: string;
    expirationDate: number;
    orderId: string;
  } | null>(null);
  const [copiedCip, setCopiedCip] = useState(false);

  // Cargar configuración de Culqi
  useEffect(() => {
    fetch('/api/checkout/config')
      .then((res) => res.json())
      .then((data) => setCulqiConfig(data))
      .catch((err) => console.warn('[Culqi] No se pudo cargar config:', err));
  }, []);

  // Configurar callback global de Culqi Checkout v4
  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.culqi = async function () {
      if (!window.Culqi) return;

      if (window.Culqi.token) {
        const token = window.Culqi.token;
        console.log('[Culqi Checkout] Token recibido:', token.id);
        window.Culqi.close();
        await processCheckoutWithToken(token.id, 'Tarjeta (Culqi)');
      } else if (window.Culqi.order) {
        const order = window.Culqi.order;
        console.log('[Culqi Checkout] Orden generada:', order.id);
        window.Culqi.close();
        setCipData({
          paymentCode: order.payment_code || 'CIP-PENDIENTE',
          expirationDate: order.expiration_date || Date.now() / 1000 + 86400,
          orderId: order.id,
        });
      } else if (window.Culqi.error) {
        console.error('[Culqi Checkout Error]', window.Culqi.error);
        setErrorMessage(
          window.Culqi.error.user_message ||
            window.Culqi.error.merchant_message ||
            'Ocurrió un error con Culqi Checkout.'
        );
        setIsProcessing(false);
      }
    };
  }, [items, currency, culqiConfig]);

  if (!isCheckoutModalOpen) return null;

  const totalUSD = getTotalUSD();
  const totalPEN = getTotalPEN();
  const displayAmount = currency === 'PEN' ? totalPEN : totalUSD;

  const handleDownloadContract = (
    item: { beatTitle: string; producerName: string; licenseName: string },
    orderId: string,
    date: string
  ) => {
    const contractContent = `====================================================================
LUBA BEATS - CERTIFICADO Y CONTRATO DE LICENCIA MUSICAL
====================================================================
Número de Orden: ${orderId}
Fecha de Emisión: ${date}

1. INFORMACIÓN DE LA OBRA Y LICENCIA:
- Título de la Pista: "${item.beatTitle}"
- Productor / Beatmaker: ${item.producerName}
- Modalidad de Licencia: ${item.licenseName}
- Plataforma: Luba Beats Marketplace (https://beats.luba-home.online)

2. TÉRMINOS Y DERECHOS:
El Productor otorga al portador de este certificado los derechos para
grabar interpretaciones vocales, mezclar y masterizar sobre el beat,
así como distribuir el resultado en plataformas de streaming digital
(Spotify, Apple Music, YouTube Music, Deezer) conforme a los términos de la
"${item.licenseName}".

3. CRÉDITOS OBLIGATORIOS:
En todo lanzamiento comercial o público, se deberá dar crédito:
"Prod. by ${item.producerName} / Luba Beats"

4. ESTADO LEGAL:
Este documento certifica la validez de la transacción completada
satisfactoriamente en Luba Beats Marketplace a través de la pasarela Culqi.
====================================================================`;
    const blob = new Blob([contractContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Licencia_${item.beatTitle.replace(/[^\w]/g, '_')}_${orderId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Enviar token de Culqi a nuestro backend para procesar el cargo
  const processCheckoutWithToken = async (tokenId?: string, methodOverride?: PaymentMethodType) => {
    setIsProcessing(true);
    setErrorMessage(null);

    const activeMethod = methodOverride || selectedMethod;

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => {
            const rawId = String(item.beat.id);
            const cleanId = parseInt(rawId.replace(/^[^\d]*/, ''), 10) || 1;
            const producerId = parseInt(String(item.beat.producer.id).replace(/^[^\d]*/, ''), 10) || 1;
            return {
              beatId: cleanId,
              producerId,
              licenseTier: item.license.tier,
              price: currency === 'PEN' ? item.license.pricePEN : item.license.price,
            };
          }),
          paymentMethod: activeMethod,
          currency,
          tokenId: tokenId || undefined,
          totalAmount: displayAmount,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No se pudo procesar la compra.');
      }

      const orderId = data.orderId || `LB-${Math.floor(100000 + Math.random() * 900000)}`;

      const generatedReceipt: SimulatedOrderReceipt = {
        orderId,
        paymentMethod: activeMethod as any,
        currency,
        amount: data.totalAmount || displayAmount,
        date: new Date().toLocaleDateString('es-PE', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        items: items.map((item) => ({
          beatTitle: item.beat.title,
          producerName: item.beat.producer.name,
          licenseName: item.license.name,
          downloadUrl: item.beat.audioPreviewUrl,
          stemsAvailable: item.license.tier !== 'basic',
        })),
      };

      setReceipt(generatedReceipt);
      clearCart();
    } catch (err: any) {
      console.error('[Checkout Error]', err);
      setErrorMessage(err.message || 'Error al procesar el pago.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Abrir Culqi Checkout Oficial 3DS Modal
  const handleOpenCulqiCheckout = () => {
    setErrorMessage(null);

    if (
      typeof window !== 'undefined' &&
      isCulqiScriptLoaded &&
      window.Culqi &&
      culqiConfig?.publicKey &&
      !culqiConfig.publicKey.includes('tu_llave')
    ) {
      try {
        window.Culqi.publicKey = culqiConfig.publicKey;
        window.Culqi.settings({
          title: 'Luba Beats Marketplace',
          currency: currency,
          amount: Math.round(displayAmount * 100),
        });

        window.Culqi.options({
          lang: 'es',
          installments: false,
          paymentMethods: {
            tarjeta: true,
            yape: true,
            billetera: true,
            bancaMovil: true,
            agente: true,
            cuotealo: false,
          },
          style: {
            logo: 'https://beats.luba-home.online/favicon.ico',
            bannerColor: '#09090b',
            buttonBackground: '#9333ea',
            menuColor: '#09090b',
            linksColor: '#c084fc',
            priceColor: '#ffffff',
          },
        });

        window.Culqi.open();
        return;
      } catch (err) {
        console.warn('[Culqi] Fallback a modal nativo por:', err);
      }
    }

    // Si las llaves no están ingresadas o el script no cargó, procesar flujo directo
    processCheckoutWithToken(undefined, 'Tarjeta (Culqi)');
  };

  // Generar Orden de PagoEfectivo (CIP)
  const handleGeneratePagoEfectivoOrder = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/checkout/culqi/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            beatId: item.beat.id,
            licenseTier: item.license.tier,
          })),
          currency,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No se pudo generar el código CIP.');
      }

      setCipData({
        paymentCode: data.paymentCode || `CIP-${Math.floor(1000000 + Math.random() * 9000000)}`,
        expirationDate: data.expirationDate || Math.floor(Date.now() / 1000) + 86400,
        orderId: data.orderId || data.orderNumber,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al generar código CIP.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyCip = () => {
    if (!cipData) return;
    navigator.clipboard.writeText(cipData.paymentCode);
    setCopiedCip(true);
    setTimeout(() => setCopiedCip(false), 2000);
  };

  const handleClose = () => {
    setIsCheckoutModalOpen(false);
    setReceipt(null);
    setCipData(null);
    setErrorMessage(null);
  };

  return (
    <>
      {/* Script oficial de Culqi Checkout v4 */}
      <Script
        src="https://checkout.culqi.com/js/v4"
        strategy="afterInteractive"
        onLoad={() => {
          setIsCulqiScriptLoaded(true);
          console.log('[Culqi Checkout v4] SDK cargado en el cliente');
        }}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border border-white/10 bg-zinc-950 p-4 sm:p-6 shadow-2xl">
          
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 z-10 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          {!receipt ? (
            <div>
              {/* Header */}
              <div className="border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
                  <Sparkles className="h-4 w-4" />
                  <span>Pasarela de Pagos Culqi Perú</span>
                  {culqiConfig?.isConfigured ? (
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400 border border-emerald-500/20">
                      {culqiConfig.isTest ? 'Culqi Sandbox' : 'Culqi Producción'}
                    </span>
                  ) : (
                    <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-[10px] text-yellow-400 border border-yellow-500/20">
                      Modo Sandbox Local
                    </span>
                  )}
                </div>
                <h2 className="mt-1 text-2xl font-black text-white">
                  Finalizar Compra de Licencias
                </h2>
                <p className="text-xs text-zinc-400">
                  Pago seguro cifrado con Culqi (Tarjetas 3DS, Yape, Plin y Agentes bancarios).
                </p>
              </div>

              {/* Error banner */}
              {errorMessage && (
                <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Currency selector & Summary */}
              <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/5 bg-zinc-900/60 p-4">
                <div>
                  <span className="text-xs text-zinc-400">Total a Pagar:</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white font-mono">
                      {currency === 'PEN' ? `S/. ${totalPEN}` : `$${totalUSD}`}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">
                      ({items.length} {items.length === 1 ? 'licencia' : 'licencias'})
                    </span>
                  </div>
                </div>

                {/* Currency toggle */}
                <div className="flex items-center rounded-xl border border-white/10 bg-zinc-900 p-1">
                  <button
                    onClick={() => setCurrency('PEN')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                      currency === 'PEN' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Soles (PEN)
                  </button>
                  <button
                    onClick={() => setCurrency('USD')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                      currency === 'USD' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Dólares (USD)
                  </button>
                </div>
              </div>

              {/* Payment Method Tabs */}
              <div className="mt-5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Elige el Método de Pago
                </label>
                <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'Tarjeta (Culqi)', name: 'Tarjeta (Culqi)', icon: CreditCard, color: 'text-emerald-400' },
                    { id: 'Yape', name: 'Yape Directo', icon: Smartphone, color: 'text-purple-400' },
                    { id: 'Plin', name: 'Plin Perú', icon: QrCode, color: 'text-cyan-400' },
                    { id: 'PagoEfectivo', name: 'Agente / CIP', icon: Building2, color: 'text-amber-400' },
                    { id: 'Mercado Pago', name: 'Mercado Pago', icon: ShieldCheck, color: 'text-blue-400' },
                  ].map((method) => {
                    const Icon = method.icon;
                    const isSelected = selectedMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        onClick={() => {
                          setSelectedMethod(method.id as PaymentMethodType);
                          setErrorMessage(null);
                        }}
                        className={`flex flex-col items-center justify-center rounded-2xl border p-2.5 sm:p-3 transition-all last:col-span-2 sm:last:col-span-1 ${
                          isSelected
                            ? 'border-purple-500 bg-purple-950/40 text-white shadow-lg shadow-purple-500/20'
                            : 'border-white/5 bg-zinc-900/60 text-zinc-400 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${method.color}`} />
                        <span className="mt-1.5 text-[11px] font-bold text-center leading-tight">
                          {method.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payment details box */}
              <div className="mt-5 rounded-2xl border border-white/5 bg-zinc-900/40 p-4">
                {selectedMethod === 'Tarjeta (Culqi)' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span>Culqi Checkout Oficial 3DS2 (Visa, Mastercard, Amex, Diners)</span>
                      <span className="text-emerald-400 font-mono font-semibold">Cifrado SSL 256-bit</span>
                    </div>
                    <p className="text-xs text-zinc-300">
                      Haz clic en el botón de abajo para abrir la ventana de pago seguro de Culqi o confirmar la transacción.
                    </p>
                    <div className="rounded-xl border border-white/5 bg-zinc-950/50 p-3 text-xs text-zinc-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Pasarela:</span>
                        <strong className="text-white">Culqi Perú (Credicorp)</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Protección:</span>
                        <span className="text-emerald-400 font-semibold">3D Secure 2.0 Antifraude</span>
                      </div>
                    </div>

                    {culqiConfig?.isTest && (
                      <div className="rounded-xl border border-purple-500/30 bg-purple-950/30 p-3 text-xs text-purple-200 space-y-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-purple-300">
                          <CreditCard className="h-4 w-4 text-purple-400" />
                          <span>Tarjetas Oficiales de Prueba Culqi (Sandbox Perú)</span>
                        </div>
                        <p className="text-[11px] text-zinc-300 font-mono">
                          Visa Exitosa: <strong className="text-emerald-400">4111 1100 0000 0021</strong>
                        </p>
                        <p className="text-[11px] text-zinc-300 font-mono">
                          Exp: <strong className="text-white">12/28</strong> | CVV: <strong className="text-white">123</strong>
                        </p>
                        <p className="text-[10px] text-zinc-400">
                          En Yape Sandbox puedes usar el celular <strong>900 000 001</strong> y cualquier código de 6 dígitos.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {selectedMethod === 'Yape' && (
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-950/30 p-2">
                      <QrCode className="h-20 w-20 text-purple-400 animate-pulse" />
                    </div>
                    <div className="space-y-1 text-center sm:text-left">
                      <span className="rounded-md bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                        Yape Perú
                      </span>
                      <h4 className="text-sm font-bold text-white">Escanea el código QR o yapea a:</h4>
                      <p className="font-mono text-base font-bold text-purple-300">994 235 517 (Lucio Magdiel Baca Sapa)</p>
                      <p className="text-[11px] text-zinc-400">
                        También puedes pagar mediante Yape con código de aprobación dentro del Checkout de Culqi.
                      </p>
                    </div>
                  </div>
                )}

                {selectedMethod === 'Plin' && (
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-950/30 p-2">
                      <QrCode className="h-20 w-20 text-cyan-400" />
                    </div>
                    <div className="space-y-1 text-center sm:text-left">
                      <span className="rounded-md bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                        Plin Interbancario
                      </span>
                      <h4 className="text-sm font-bold text-white">Plin a número afiliado:</h4>
                      <p className="font-mono text-base font-bold text-cyan-300">994 235 517 (Lucio Magdiel Baca Sapa)</p>
                      <p className="text-[11px] text-zinc-400">
                        Compatible con BCP, BBVA, Scotiabank, Interbank y BanBif.
                      </p>
                    </div>
                  </div>
                )}

                {selectedMethod === 'PagoEfectivo' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span>Pago en Agentes y Banca por Internet (PagoEfectivo / CIP)</span>
                      <span className="text-amber-400 font-semibold">Vence en 24 horas</span>
                    </div>

                    {!cipData ? (
                      <div className="text-center py-3 space-y-2">
                        <p className="text-xs text-zinc-300">
                          Genera un código CIP único para pagar en efectivo en cualquier agente BCP, BBVA, Interbank, Kasnet, Tambo+ o tu banca móvil.
                        </p>
                        <button
                          type="button"
                          onClick={handleGeneratePagoEfectivoOrder}
                          disabled={isProcessing}
                          className="inline-flex items-center gap-2 rounded-xl bg-amber-500/20 border border-amber-500/30 px-4 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition-colors"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span>Generando Código CIP...</span>
                            </>
                          ) : (
                            <>
                              <Building2 className="h-3.5 w-3.5" />
                              <span>Generar Código CIP de Pago</span>
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                          Tu Código de Pago CIP:
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xl font-black text-white tracking-widest">
                            {cipData.paymentCode}
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyCip}
                            className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700 transition-colors"
                          >
                            {copiedCip ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                            <span>{copiedCip ? 'Copiado' : 'Copiar'}</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          Ingresa a tu banca móvil o acércate a cualquier agente e indica que pagarás a <strong>PagoEfectivo / Culqi</strong> con este código.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {selectedMethod === 'Mercado Pago' && (
                  <div className="text-center py-2 space-y-1">
                    <span className="text-sm font-bold text-white">Mercado Pago Checkout Pro (Latam)</span>
                    <p className="text-xs text-zinc-400">
                      Soporte para compradores en Argentina, México, Colombia, Chile, Perú y Brasil.
                    </p>
                  </div>
                )}
              </div>

              {/* Action CTA */}
              <div className="mt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  onClick={handleClose}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors text-center"
                >
                  Cancelar
                </button>

                {selectedMethod === 'Tarjeta (Culqi)' ? (
                  <button
                    disabled={isProcessing}
                    onClick={handleOpenCulqiCheckout}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-500 px-6 py-3 text-sm font-extrabold text-white shadow-xl shadow-purple-600/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 text-center"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Procesando con Culqi...</span>
                      </>
                    ) : (
                      <>
                        <span>Pagar con Culqi ({currency === 'PEN' ? `S/. ${totalPEN}` : `$${totalUSD}`})</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                ) : selectedMethod === 'PagoEfectivo' && cipData ? (
                  <button
                    disabled={isProcessing}
                    onClick={() => processCheckoutWithToken(undefined, 'PagoEfectivo')}
                    className="flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-6 py-3 text-sm font-extrabold text-white shadow-xl hover:bg-amber-500 transition-all text-center"
                  >
                    <span>Confirmar Orden CIP</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    disabled={isProcessing}
                    onClick={() => processCheckoutWithToken()}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 px-6 py-3 text-sm font-extrabold text-white shadow-xl shadow-purple-600/30 hover:from-purple-500 hover:to-cyan-400 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 text-center"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Validando Pago y Registrando...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirmar Pago de {currency === 'PEN' ? `S/. ${totalPEN}` : `$${totalUSD}`}</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* SUCCESS RECEIPT STATE */
            <div className="space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 ring-8 ring-emerald-500/10">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <span className="mt-3 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                  ¡Pago Autorizado con Culqi!
                </span>
                <h2 className="mt-2 text-2xl font-black text-white">
                  Orden #{receipt.orderId}
                </h2>
                <p className="text-xs text-zinc-400">
                  Transacción completada mediante <strong className="text-white">{receipt.paymentMethod}</strong> el {receipt.date}.
                </p>
              </div>

              {/* Items Ready for Download */}
              <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-300 border-b border-white/5 pb-2">
                  <span>Tus Archivos de Audio & Licencias:</span>
                  <span className="text-purple-400">Descarga Directa Activada</span>
                </div>

                {receipt.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-zinc-950 p-3 border border-white/5"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.beatTitle}</h4>
                      <p className="text-xs text-zinc-400">
                        {item.producerName} • <span className="text-purple-400 font-semibold">{item.licenseName}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Contract Download */}
                      <button
                        type="button"
                        onClick={() => handleDownloadContract(item, receipt.orderId, receipt.date)}
                        className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
                        title="Descargar Certificado y Contrato de Licencia"
                      >
                        <FileText className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Licencia</span>
                      </button>

                      {/* Audio Master Download */}
                      <a
                        href={item.downloadUrl}
                        download={`${item.beatTitle.replace(/[^\w]/g, '_')}_Master.${
                          item.licenseName.toLowerCase().includes('wav') ? 'wav' : 'mp3'
                        }`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-500 transition-colors shadow-md"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Audio Master</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center pt-2">
                <button
                  onClick={handleClose}
                  className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-3 text-sm font-bold text-white hover:from-purple-500 hover:to-indigo-500 transition-all"
                >
                  Listo, Volver al Marketplace
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};
