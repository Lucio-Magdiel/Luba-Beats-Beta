import { create } from 'zustand';
import { useAudioStore } from './useAudioStore';

interface FavoritesStore {
  favoriteIds: Set<string>;
  isLoading: boolean;
  initialized: boolean;
  initFavorites: () => Promise<void>;
  isFavorite: (beatId: string) => boolean;
  toggleFavorite: (beatId: string) => Promise<{ success: boolean; isFavorite: boolean; totalLikes?: number }>;
}

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  favoriteIds: new Set<string>(),
  isLoading: false,
  initialized: false,

  initFavorites: async () => {
    try {
      if (get().initialized) return;
      set({ isLoading: true });
      const res = await fetch('/api/favorites');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.favoriteIds)) {
          set({
            favoriteIds: new Set(data.favoriteIds.map(String)),
            initialized: true,
          });
        }
      }
    } catch (err) {
      console.warn('No se pudieron cargar los favoritos:', err);
    } finally {
      set({ isLoading: false, initialized: true });
    }
  },

  isFavorite: (beatId: string) => {
    const numericId = String(beatId).replace(/^[^\d]*/, '');
    const { favoriteIds } = get();
    return favoriteIds.has(beatId) || favoriteIds.has(numericId);
  },

  toggleFavorite: async (beatId: string) => {
    const { favoriteIds } = get();
    const numericId = String(beatId).replace(/^[^\d]*/, '') || beatId;
    const currentlyFav = favoriteIds.has(beatId) || favoriteIds.has(numericId);

    // Actualización optimista en cliente
    const nextIds = new Set(favoriteIds);
    if (currentlyFav) {
      nextIds.delete(beatId);
      nextIds.delete(numericId);
    } else {
      nextIds.add(beatId);
      nextIds.add(numericId);
    }
    set({ favoriteIds: nextIds });
    useAudioStore.getState().updateBeatLikes(beatId, !currentlyFav);

    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ beatId }),
      });

      if (!res.ok) {
        // Revertir si hubo error (por ejemplo, si no ha iniciado sesión)
        set({ favoriteIds });
        useAudioStore.getState().updateBeatLikes(beatId, currentlyFav);
        const errData = await res.json().catch(() => ({}));
        return { success: false, isFavorite: currentlyFav, error: errData.error };
      }

      const data = await res.json();
      useAudioStore.getState().updateBeatLikes(beatId, data.isFavorite, data.totalLikes);
      return {
        success: true,
        isFavorite: data.isFavorite,
        totalLikes: data.totalLikes,
      };
    } catch (err) {
      console.error('Error al guardar favorito:', err);
      // Revertir
      set({ favoriteIds });
      useAudioStore.getState().updateBeatLikes(beatId, currentlyFav);
      return { success: false, isFavorite: currentlyFav };
    }
  },
}));
