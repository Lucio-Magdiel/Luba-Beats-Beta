'use client';

import { useState } from 'react';
import { X, Check, ShieldCheck, FileAudio } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

export const LicenseModal: React.FC = () => {
  const {
    isLicenseModalOpen,
    selectedBeatForLicense,
    closeLicenseModal,
    addItem,
    setIsCheckoutModalOpen
  } = useCartStore();

  const [selectedTier, setSelectedTier] = useState<'basic' | 'premium' | 'exclusive'>('premium');

  if (!isLicenseModalOpen || !selectedBeatForLicense) return null;

  const licenses = selectedBeatForLicense.licenses || [];
  const hasLicenses = licenses.length > 0;
  const currentLicense = licenses.find((l) => l.tier === selectedTier) || licenses[0];

  const handleAddToCart = () => {
    if (currentLicense) {
      addItem(selectedBeatForLicense, currentLicense);
    }
  };

  const handleInstantBuy = () => {
    if (currentLicense) {
      addItem(selectedBeatForLicense, currentLicense);
      setIsCheckoutModalOpen(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={closeLicenseModal}
          className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header with Beat summary */}
        <div className="flex items-center gap-4 border-b border-white/10 pb-5">
          <img
            src={selectedBeatForLicense.coverUrl}
            alt={selectedBeatForLicense.title}
            className="h-16 w-16 rounded-2xl object-cover border border-white/10 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-semibold text-purple-400">
                {hasLicenses ? 'Selecciona tu Licencia' : 'Información de Pista'}
              </span>
              <span className="rounded bg-zinc-900 px-2 py-0.5 text-[10px] font-mono text-zinc-400 border border-white/5">
                {selectedBeatForLicense.bpm} BPM • {selectedBeatForLicense.key}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white">
              {selectedBeatForLicense.title}
            </h2>
            <p className="text-xs text-zinc-400">
              Producido por <span className="text-zinc-200 font-semibold">{selectedBeatForLicense.producer.name}</span>
            </p>
          </div>
        </div>

        {!hasLicenses || !currentLicense ? (
          <div className="py-12 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <FileAudio className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-white">Esta pista no tiene licencias comerciales a la venta</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              {selectedBeatForLicense.type === 'musica'
                ? 'Esta es una canción / demo completa disponible para escuchar en streaming de forma gratuita.'
                : 'Esta pista instrumental no requiere compra o es de acceso libre para la comunidad.'}
            </p>
            {selectedBeatForLicense.audioPreviewUrl && (
              <a
                href={selectedBeatForLicense.audioPreviewUrl}
                download={`${selectedBeatForLicense.title}.mp3`}
                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-500 transition-all"
              >
                Descargar Audio
              </a>
            )}
          </div>
        ) : (
          <>
            {/* License Options Selector */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
              {licenses.map((license) => {
                const isSelected = selectedTier === license.tier;
                return (
                  <div
                    key={license.tier}
                    onClick={() => setSelectedTier(license.tier)}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'border-purple-500 bg-purple-950/30 shadow-lg shadow-purple-500/20 ring-1 ring-purple-500'
                        : 'border-white/10 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                          {license.tier}
                        </span>
                        {license.tier === 'premium' && (
                          <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[9px] font-bold text-cyan-400 border border-cyan-500/30">
                            Popular
                          </span>
                        )}
                      </div>

                      <h3 className="mt-2 text-sm font-bold text-white">
                        {license.name}
                      </h3>

                      <div className="mt-2 flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-white font-mono">
                          ${license.price}
                        </span>
                        <span className="text-xs text-zinc-400">
                          (S/. {license.pricePEN})
                        </span>
                      </div>

                      <p className="mt-2 text-[11px] text-zinc-400 line-clamp-2">
                        {license.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5 text-[11px] text-zinc-300">
                      <div className="flex items-center gap-1.5">
                        <FileAudio className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                        <span className="truncate">{license.format}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{license.streamsLimit}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Tier Highlights */}
            <div className="mt-6 rounded-2xl border border-white/5 bg-zinc-900/60 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Términos y Derechos Incluidos en: {currentLicense.name}</span>
              </div>
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-zinc-400">
                <div>
                  <span className="block text-[10px] text-zinc-500 uppercase">Archivos</span>
                  <strong className="text-zinc-200">{currentLicense.format}</strong>
                </div>
                <div>
                  <span className="block text-[10px] text-zinc-500 uppercase">Streaming</span>
                  <strong className="text-zinc-200">{currentLicense.streamsLimit}</strong>
                </div>
                <div>
                  <span className="block text-[10px] text-zinc-500 uppercase">Videos Musicales</span>
                  <strong className="text-zinc-200">{currentLicense.musicVideoLimit}</strong>
                </div>
                <div>
                  <span className="block text-[10px] text-zinc-500 uppercase">Radio & Shows</span>
                  <strong className="text-zinc-200">
                    {currentLicense.radioBroadcasting ? 'Permitido' : 'No incluido'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10 pt-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Total a pagar:</span>
                <span className="text-xl font-black text-white font-mono">
                  ${currentLicense.price} USD
                </span>
                <span className="text-sm font-semibold text-zinc-400">
                  / S/. {currentLicense.pricePEN} PEN
                </span>
              </div>

              <div className="flex w-full sm:w-auto items-center gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 sm:flex-none rounded-xl border border-white/10 bg-zinc-900 px-5 py-3 text-xs font-bold text-white hover:bg-zinc-800 transition-colors"
                >
                  Añadir al Carrito
                </button>
                <button
                  onClick={handleInstantBuy}
                  className="flex-1 sm:flex-none rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-6 py-3 text-xs font-extrabold text-white shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-cyan-400 transition-all hover:scale-105"
                >
                  Comprar Ahora (Simulador)
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
