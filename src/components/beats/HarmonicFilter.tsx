'use client';

import { Search, Music, Zap, LayoutGrid, List, RotateCcw, Disc3, Music2, Layers } from 'lucide-react';
import { MOCK_GENRES, MOCK_KEYS } from '@/data/mockBeats';
import { FilterState } from '@/types/beat';

interface HarmonicFilterProps {
  filter: FilterState;
  onFilterChange: (newFilter: FilterState) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  totalResults: number;
}

export const HarmonicFilter: React.FC<HarmonicFilterProps> = ({
  filter,
  onFilterChange,
  viewMode,
  onViewModeChange,
  totalResults,
}) => {
  const handleReset = () => {
    onFilterChange({
      search: '',
      genre: 'Todos',
      bpmRange: [60, 180],
      key: 'Cualquier Tonalidad',
      mood: 'Todos',
      categoryTab: 'todo',
      sortBy: 'trending'
    });
  };

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-zinc-950/80 p-4 sm:p-6 backdrop-blur-xl">
      
      {/* Top Segmented Category Switcher (Todo | Beats | Música) - Inspired by v1 */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center rounded-2xl border border-white/10 bg-zinc-900/90 p-1.5 shadow-lg w-full sm:w-auto">
          {/* Tab: Todo */}
          <button
            onClick={() => onFilterChange({ ...filter, categoryTab: 'todo' })}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl px-3 sm:px-5 py-2 text-xs font-extrabold transition-all duration-300 ${
              filter.categoryTab === 'todo'
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Todo</span>
          </button>

          {/* Tab: Beats */}
          <button
            onClick={() => onFilterChange({ ...filter, categoryTab: 'beat' })}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl px-3 sm:px-5 py-2 text-xs font-extrabold transition-all duration-300 ${
              filter.categoryTab === 'beat'
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/30'
                : 'text-zinc-400 hover:text-emerald-400'
            }`}
          >
            <Disc3 className="h-4 w-4" />
            <span>Beats</span>
          </button>

          {/* Tab: Música */}
          <button
            onClick={() => onFilterChange({ ...filter, categoryTab: 'musica' })}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl px-3 sm:px-5 py-2 text-xs font-extrabold transition-all duration-300 ${
              filter.categoryTab === 'musica'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-zinc-400 hover:text-purple-400'
            }`}
          >
            <Music2 className="h-4 w-4" />
            <span>Música</span>
          </button>
        </div>

        {/* View Mode Toggle and Sort */}
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          {/* Sort Dropdown */}
          <select
            value={filter.sortBy}
            onChange={(e) =>
              onFilterChange({
                ...filter,
                sortBy: e.target.value as FilterState['sortBy']
              })
            }
            className="flex-1 sm:flex-none rounded-xl border border-white/10 bg-zinc-900/90 px-3 py-2 text-xs font-medium text-zinc-300 outline-none transition-colors hover:border-white/20 focus:border-purple-500"
          >
            <option value="trending">🔥 En Tendencia</option>
            <option value="popular">🎧 Más Reproducidos</option>
            <option value="newest">✨ Más Recientes</option>
            <option value="price_low">💰 Menor Precio</option>
            <option value="price_high">💎 Mayor Precio</option>
          </select>

          {/* Grid/List switch */}
          <div className="flex items-center rounded-xl border border-white/10 bg-zinc-900/80 p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`rounded-lg p-1.5 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Vista en Cuadrícula"
              aria-label="Vista cuadrícula"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`rounded-lg p-1.5 transition-colors ${
                viewMode === 'list'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Vista en Lista de Pistas"
              aria-label="Vista lista"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={filter.search}
          onChange={(e) => onFilterChange({ ...filter, search: e.target.value })}
          placeholder="Buscar por título, productor, artista o tag (ej. Mongo, Trap, 140 BPM)..."
          className="w-full rounded-xl border border-white/10 bg-zinc-900/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-emerald-500/50 focus:bg-zinc-900 focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      {/* Genre Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {MOCK_GENRES.map((genre) => {
          const isSelected = filter.genre === genre || (genre === 'Todos' && !filter.genre);
          return (
            <button
              key={genre}
              onClick={() => onFilterChange({ ...filter, genre: genre === 'Todos' ? '' : genre })}
              className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                isSelected
                  ? 'bg-zinc-100 text-zinc-950 font-bold shadow-md shadow-white/10'
                  : 'bg-zinc-900/80 text-zinc-400 border border-white/5 hover:border-white/15 hover:text-zinc-200'
              }`}
            >
              {genre}
            </button>
          );
        })}
      </div>

      {/* Harmonic Controls Bar: BPM range + Musical Key (Scale) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/5">
        
        {/* Musical Key / Scale Picker */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
            <Music className="h-3.5 w-3.5 text-cyan-400" />
            <span>Escala / Tonalidad (Key)</span>
          </label>
          <select
            value={filter.key}
            onChange={(e) => onFilterChange({ ...filter, key: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-zinc-900/90 px-3 py-2 text-xs font-medium text-zinc-200 outline-none hover:border-white/20 focus:border-cyan-400"
          >
            {MOCK_KEYS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>

        {/* BPM Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-emerald-400" />
              <span>Tempo (BPM): {filter.bpmRange[0]} - {filter.bpmRange[1]}</span>
            </span>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <span className="text-[11px] font-mono text-zinc-500">60</span>
            <input
              type="range"
              min="60"
              max="180"
              value={filter.bpmRange[1]}
              onChange={(e) =>
                onFilterChange({
                  ...filter,
                  bpmRange: [filter.bpmRange[0], parseInt(e.target.value)]
                })
              }
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-lg bg-zinc-800 accent-emerald-500"
            />
            <span className="text-[11px] font-mono text-zinc-500">180</span>
          </div>
        </div>

        {/* Reset & Count */}
        <div className="flex items-end justify-between sm:justify-end gap-3">
          <span className="text-xs text-zinc-400 font-medium">
            <strong className="text-white font-bold">{totalResults}</strong> pistas disponibles
          </span>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-zinc-900/80 px-3 py-2 text-xs font-semibold text-zinc-400 transition-colors hover:border-white/20 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restablecer
          </button>
        </div>

      </div>
    </div>
  );
};
