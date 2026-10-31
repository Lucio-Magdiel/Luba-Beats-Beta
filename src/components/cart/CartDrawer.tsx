'use client';

import { X, Trash2, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeItem,
    getTotalUSD,
    getTotalPEN,
    setIsCheckoutModalOpen
  } = useCartStore();

  if (!isCartOpen) return null;

  const totalUSD = getTotalUSD();
  const totalPEN = getTotalPEN();

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex h-full w-full max-w-md flex-col justify-between border-l border-white/10 bg-zinc-950 p-4 sm:p-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-purple-400" />
              <h2 className="text-lg font-bold text-white">Carrito de Compras</h2>
              <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-xs font-semibold text-purple-400 border border-purple-500/20">
                {items.length} {items.length === 1 ? 'beat' : 'beats'}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
              aria-label="Cerrar carrito"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart items list */}
          <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
            {items.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 space-y-2">
                <ShoppingBag className="mx-auto h-12 w-12 text-zinc-700" />
                <p className="text-sm font-medium">Tu carrito está vacío</p>
                <p className="text-xs text-zinc-600">Explora el catálogo y añade instrumentales para comprar sus licencias.</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.beat.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-zinc-900/60 p-3"
                >
                  <img
                    src={item.beat.coverUrl}
                    alt={item.beat.title}
                    className="h-12 w-12 rounded-xl object-cover border border-white/10"
                  />
                  <div className="flex flex-1 flex-col overflow-hidden">
                    <span className="truncate text-xs font-bold text-white">
                      {item.beat.title}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {item.license.name}
                    </span>
                    <div className="mt-1 flex items-baseline gap-1.5 font-mono text-xs">
                      <span className="font-bold text-purple-300">
                        ${item.license.price}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        (S/. {item.license.pricePEN})
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.beat.id)}
                    className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                    title="Eliminar del carrito"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer with totals and checkout */}
        {items.length > 0 && (
          <div className="border-t border-white/10 pt-4 space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Subtotal</span>
                <span>${totalUSD} USD</span>
              </div>
              <div className="flex justify-between text-base font-black text-white">
                <span>Total Estimado</span>
                <div className="text-right font-mono">
                  <div>${totalUSD} USD</div>
                  <div className="text-xs font-normal text-zinc-400">
                    Aprox. S/. {totalPEN} PEN
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-purple-500/10 p-2.5 text-center text-[11px] text-purple-300 border border-purple-500/20 flex items-center justify-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Soporte para Yape, Plin y Tarjetas disponible</span>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-purple-600/30 hover:from-purple-500 hover:to-cyan-400 transition-all hover:scale-[1.02]"
            >
              <span>Proceder al Pago</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
