'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Download,
  FileText,
  Play,
  Pause,
  ArrowLeft,
  Disc3,
} from 'lucide-react';
import { useAudioStore } from '@/store/useAudioStore';
import { Beat } from '@/types/beat';

interface PurchaseItem {
  id: number;
  precio: number;
  moneda: string;
  licencia: string;
  metodo_pago: string;
  referencia_pago: string;
  estado: string;
  fecha_compra: string;
  beat_id: number;
  beat_titulo: string;
  archivo_preview: string;
  archivo_full: string;
  beat_cover: string;
  productor_nombre: string;
}

interface Props {
  user: {
    id: number;
    name: string;
    email: string;
  };
  purchases: PurchaseItem[];
}

export function ComprasClient({ user, purchases }: Props) {
  const { currentBeat, isPlaying, playBeat, pauseBeat } = useAudioStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPurchases = purchases.filter((p) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      p.beat_titulo.toLowerCase().includes(q) ||
      p.productor_nombre.toLowerCase().includes(q) ||
      p.referencia_pago.toLowerCase().includes(q)
    );
  });

  const handleDownloadContract = (item: PurchaseItem) => {
    const contractContent = `====================================================================
LUBA BEATS - CERTIFICADO Y CONTRATO DE LICENCIA MUSICAL
====================================================================
Número de Orden: ${item.referencia_pago}
Fecha de Adquisición: ${new Date(item.fecha_compra).toLocaleDateString('es-PE')}
Titular Comprador: @${user.name} (${user.email})

1. INFORMACIÓN DE LA OBRA Y LICENCIA:
- Título de la Pista: "${item.beat_titulo}"
- Productor / Beatmaker: ${item.productor_nombre}
- Modalidad de Licencia: Licencia ${item.licencia.toUpperCase()}
- Importe Abonado: ${item.moneda} ${item.precio} (${item.metodo_pago})
- Estado de la Transacción: ${item.estado.toUpperCase()}

2. TÉRMINOS Y DERECHOS CONCEDIDOS:
El Productor otorga al Comprador los derechos legales para grabar voces,
mezclar y masterizar sobre el beat, así como publicar y comercializar fonogramas
de acuerdo con los términos de la Licencia ${item.licencia.toUpperCase()} en todas
las plataformas digitales (Spotify, Apple Music, YouTube, etc.).

3. CRÉDITOS OFICIALES:
El Comprador se compromete a acreditar debidamente en los lanzamientos:
"Prod. by ${item.productor_nombre} / Luba Beats"

4. VALIDACIÓN DE AUTENTICIDAD:
Este documento certifica que los derechos fueron formalmente cedidos
a través de la plataforma oficial Luba Beats (https://beats.luba-home.online).
====================================================================`;

    const blob = new Blob([contractContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Licencia_${item.beat_titulo.replace(/[^\w]/g, '_')}_${item.referencia_pago}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePlay = (item: PurchaseItem) => {
    const isCurrentPlaying = currentBeat?.id === String(item.beat_id) && isPlaying;
    if (isCurrentPlaying) {
      pauseBeat();
    } else {
      const syntheticBeat: Beat = {
        id: String(item.beat_id),
        title: item.beat_titulo,
        slug: `${item.beat_titulo.toLowerCase().replace(/\s+/g, '-')}-${item.beat_id}`,
        type: 'beat',
        producer: {
          id: '0',
          name: item.productor_nombre,
          handle: item.productor_nombre,
          avatar: '',
          verified: true,
          country: 'Perú',
          totalBeats: 1,
        },
        genre: 'Trap' as any,
        bpm: 140,
        key: 'C Minor' as any,
        mood: 'Energético' as any,
        tags: ['Comprado', item.licencia],
        duration: 180,
        durationFormatted: '3:00',
        audioPreviewUrl: item.archivo_full || item.archivo_preview,
        coverUrl: item.beat_cover,
        waveform: Array(50).fill(0.5),
        priceFrom: item.precio,
        priceFromPEN: Math.round(item.precio * 3.75),
        plays: 1,
        likes: 1,
        createdAt: item.fecha_compra,
        licenses: [],
      };
      playBeat(syntheticBeat);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] pb-32">
      {/* Header Banner */}
      <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-purple-950/30 via-zinc-950 to-[#09090b] pt-8 pb-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al Catálogo</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="rounded-full bg-purple-500/20 border border-purple-500/30 px-3 py-0.5 text-[10px] font-extrabold font-mono uppercase tracking-widest text-purple-300">
                  Biblioteca Personal
                </span>
                <span className="text-xs text-zinc-500">•</span>
                <span className="text-xs text-zinc-400">@{user.name}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Mis Beats y Licencias Compradas
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
                Descarga tus archivos de audio master en alta fidelidad y accede a tus contratos legales oficiales.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-4 text-center sm:text-right">
              <span className="text-[11px] font-mono uppercase text-zinc-400">Total Adquiridos</span>
              <div className="text-2xl font-black text-purple-400 font-mono">
                {purchases.length} {purchases.length === 1 ? 'beat' : 'beats'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        {purchases.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-zinc-900/40 p-12 text-center space-y-4 max-w-lg mx-auto">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Aún no has adquirido beats</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Explora nuestro catálogo de instrumentales con filtros armónicos por BPM y escala musical para comenzar tu próxima producción.
            </p>
            <div className="pt-2">
              <Link
                href="/#catalogo"
                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-500 transition-all"
              >
                <Disc3 className="h-4 w-4" />
                <span>Explorar Catálogo</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center gap-4">
              <p className="text-xs text-zinc-400">
                Mostrando {filteredPurchases.length} de {purchases.length} compras registradas.
              </p>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por título, productor o número de orden..."
                className="w-72 rounded-xl border border-white/10 bg-zinc-900/90 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPurchases.map((item) => {
                const isPlayingThis = currentBeat?.id === String(item.beat_id) && isPlaying;
                return (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between rounded-2xl border border-white/10 bg-zinc-950/80 p-4 transition-all hover:border-purple-500/40 shadow-xl"
                  >
                    <div>
                      <div className="flex items-center gap-3.5">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10">
                          <img
                            src={item.beat_cover}
                            alt={item.beat_titulo}
                            className="h-full w-full object-cover"
                          />
                          <button
                            onClick={() => handlePlay(item)}
                            className="absolute inset-0 m-auto flex h-8 w-8 items-center justify-center rounded-full bg-purple-600/90 text-white shadow-md hover:scale-110 transition-transform"
                          >
                            {isPlayingThis ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white ml-0.5" />}
                          </button>
                        </div>

                        <div className="flex flex-col overflow-hidden">
                          <span className="truncate text-sm font-bold text-white">
                            {item.beat_titulo}
                          </span>
                          <span className="text-xs text-zinc-400">
                            Productor: <strong className="text-zinc-200">{item.productor_nombre}</strong>
                          </span>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="rounded-md bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 text-[10px] font-bold text-purple-300 uppercase">
                              Licencia {item.licencia}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Details row */}
                      <div className="mt-4 border-t border-white/5 pt-3 space-y-1.5 text-xs text-zinc-400">
                        <div className="flex justify-between">
                          <span>Orden:</span>
                          <span className="font-mono text-zinc-300 font-bold">{item.referencia_pago}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fecha:</span>
                          <span className="font-mono text-zinc-300">
                            {new Date(item.fecha_compra).toLocaleDateString('es-PE')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Monto Abonado:</span>
                          <span className="font-mono font-bold text-emerald-400">
                            {item.moneda} {item.precio.toFixed(2)} ({item.metodo_pago})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-5 pt-3 border-t border-white/10 flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadContract(item)}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-zinc-900 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors"
                      >
                        <FileText className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Contrato</span>
                      </button>

                      <a
                        href={item.archivo_full || item.archivo_preview}
                        download={`${item.beat_titulo.replace(/[^\w]/g, '_')}_Master.${item.licencia.toLowerCase().includes('wav') ? 'wav' : 'mp3'}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white hover:bg-purple-500 transition-colors shadow-md"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Audio Master</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
