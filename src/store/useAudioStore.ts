import { create } from 'zustand';
import { Beat } from '@/types/beat';

// Utility to build an intelligent autoplay queue (Spotify / YouTube Music style)
export const buildAutoplayQueue = (current: Beat, pool: Beat[]): Beat[] => {
  // Deduplicate and filter out the current track
  const seenIds = new Set<string>([current.id]);
  const candidates = pool.filter((b) => {
    if (seenIds.has(b.id) || b.slug === current.slug) return false;
    seenIds.add(b.id);
    return true;
  });

  // Score candidate relevance based on genre, type, mood, and producer
  const scored = candidates.map((item) => {
    let score = 0;
    // Strong affinity: same content type (musica vs beat)
    if (item.type === current.type) score += 10;
    // Same genre
    if (item.genre === current.genre) score += 6;
    // Same mood
    if (item.mood === current.mood) score += 4;
    // Same producer / artist
    if (item.producer?.id === current.producer?.id) score += 3;
    // Dynamic jitter for fresh radio mix
    score += Math.random() * 2.5;

    return { item, score };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  const recommended = scored.slice(0, 15).map((s) => s.item);
  return [current, ...recommended];
};

interface AudioStore {
  currentBeat: Beat | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  queue: Beat[];
  repeatMode: 'off' | 'all' | 'one';
  seekTarget: number | null; // Trigger for the player component to seek
  activeCategory: 'todo' | 'beat' | 'musica';
  uploadedBeats: Beat[];
  catalog: Beat[];
  isQueueOpen: boolean;

  initCatalog: () => Promise<void>;
  setCatalog: (beats: Beat[]) => void;
  addUploadedBeat: (beat: Beat) => void;
  setActiveCategory: (category: 'todo' | 'beat' | 'musica') => void;
  playBeat: (beat: Beat, queue?: Beat[]) => void;
  togglePlay: () => void;
  pause: () => void;
  pauseBeat: () => void;
  resume: () => void;
  seek: (seconds: number) => void;
  clearSeekTarget: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  nextBeat: () => void;
  prevBeat: () => void;
  addToQueue: (beat: Beat) => void;
  toggleRepeat: () => void;

  // YouTube Music Queue / Playlist Methods
  setIsQueueOpen: (open: boolean) => void;
  toggleQueueOpen: () => void;
  setQueue: (queue: Beat[]) => void;
  removeFromQueue: (beatId: string) => void;
  moveQueueItem: (fromIndex: number, direction: 'up' | 'down') => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  shuffleQueue: () => void;
  clearQueue: () => void;
  playFromQueue: (index: number) => void;
  updateBeatLikes: (beatId: string, isFav: boolean, totalLikes?: number) => void;
}

export const useAudioStore = create<AudioStore>((set, get) => ({
  currentBeat: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isMuted: false,
  queue: [],
  repeatMode: 'off',
  seekTarget: null,
  activeCategory: 'todo',
  uploadedBeats: [],
  catalog: [],
  isQueueOpen: false,

  initCatalog: async () => {
    try {
      if (typeof window === 'undefined') return;
      const res = await fetch('/api/beats');
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.beats)) {
        set({ catalog: data.beats });
      }
    } catch (err) {
      console.warn('Could not fetch catalog from API:', err);
    }
  },

  setCatalog: (catalog) => set({ catalog }),

  addUploadedBeat: (beat) => {
    set((state) => ({
      uploadedBeats: [beat, ...state.uploadedBeats],
      catalog: [beat, ...state.catalog],
      queue: [beat, ...state.queue]
    }));
  },

  setActiveCategory: (activeCategory) => set({ activeCategory }),

  playBeat: (beat, queue) => {
    const state = get();
    // If clicking same beat that's playing, toggle
    if (state.currentBeat?.id === beat.id) {
      set({ isPlaying: !state.isPlaying });
      return;
    }

    // Determine playlist queue:
    // If an explicit multi-track queue was passed, use it.
    // Otherwise, generate an intelligent autoplay queue from the catalog.
    let finalQueue: Beat[];
    if (queue && queue.length > 1) {
      finalQueue = queue;
    } else {
      finalQueue = buildAutoplayQueue(beat, state.catalog);
    }

    // Optimistically increment views/plays
    const updatedPlays = (beat.plays || 0) + 1;
    const updatedBeat = { ...beat, plays: updatedPlays };
    const updatedQueue = finalQueue.map((b) =>
      b.id === beat.id ? { ...b, plays: updatedPlays } : b
    );
    const updatedCatalog = state.catalog.map((b) =>
      b.id === beat.id ? { ...b, plays: updatedPlays } : b
    );

    // Persist play count in backend DB (non-blocking)
    if (typeof window !== 'undefined') {
      fetch('/api/beats/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ beatId: beat.id }),
      }).catch((err) => console.warn('Could not record view:', err));
    }

    set({
      currentBeat: updatedBeat,
      isPlaying: true,
      currentTime: 0,
      duration: beat.duration,
      seekTarget: 0,
      queue: updatedQueue,
      catalog: updatedCatalog,
    });
  },

  togglePlay: () => {
    const { currentBeat, isPlaying } = get();
    if (!currentBeat) return;
    set({ isPlaying: !isPlaying });
  },

  pause: () => set({ isPlaying: false }),
  pauseBeat: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),

  seek: (seconds) => {
    set({ seekTarget: seconds, currentTime: seconds });
  },

  clearSeekTarget: () => set({ seekTarget: null }),

  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),

  setVolume: (volume) => {
    const clamped = Math.max(0, Math.min(1, volume));
    set({ volume: clamped, isMuted: clamped === 0 });
  },

  toggleMute: () => {
    const { isMuted, volume } = get();
    if (isMuted) {
      set({ isMuted: false, volume: volume === 0 ? 0.7 : volume });
    } else {
      set({ isMuted: true });
    }
  },

  nextBeat: () => {
    const { queue, currentBeat, repeatMode, catalog } = get();
    if (!currentBeat) return;

    // 1. Single-track repeat loop
    if (repeatMode === 'one') {
      set({ currentTime: 0, seekTarget: 0, isPlaying: true });
      return;
    }

    // 2. Locate current track in queue
    const currentIndex = queue.findIndex(
      (b) => b.id === currentBeat.id || b.slug === currentBeat.slug
    );

    // 3. Play next item in queue if available
    if (currentIndex !== -1 && currentIndex < queue.length - 1) {
      const next = queue[currentIndex + 1];
      set({
        currentBeat: next,
        isPlaying: true,
        currentTime: 0,
        seekTarget: 0,
        duration: next.duration
      });
      return;
    }

    // 4. Repeat all queue if repeatMode is 'all'
    if (repeatMode === 'all') {
      if (queue.length > 0) {
        const first = queue[0];
        set({
          currentBeat: first,
          isPlaying: true,
          currentTime: 0,
          seekTarget: 0,
          duration: first.duration
        });
        return;
      }
    }

    // 5. Autoplay (YouTube Music / Spotify style):
    // When queue ends and repeat is off, auto-generate more recommendations
    const moreRecommendations = buildAutoplayQueue(currentBeat, catalog).filter(
      (b) => !queue.some((q) => q.id === b.id)
    );

    if (moreRecommendations.length > 0) {
      const next = moreRecommendations[0];
      set({
        queue: [...queue, ...moreRecommendations],
        currentBeat: next,
        isPlaying: true,
        currentTime: 0,
        seekTarget: 0,
        duration: next.duration
      });
    } else if (queue.length > 0) {
      // Endless radio loop fallback
      const first = queue[0];
      set({
        currentBeat: first,
        isPlaying: true,
        currentTime: 0,
        seekTarget: 0,
        duration: first.duration
      });
    } else {
      set({ isPlaying: false });
    }
  },

  prevBeat: () => {
    const { queue, currentBeat, currentTime } = get();
    if (!currentBeat || queue.length === 0) return;

    // If more than 3 seconds in, restart track
    if (currentTime > 3) {
      set({ currentTime: 0, seekTarget: 0, isPlaying: true });
      return;
    }

    const currentIndex = queue.findIndex(
      (b) => b.id === currentBeat.id || b.slug === currentBeat.slug
    );

    if (currentIndex > 0) {
      const prev = queue[currentIndex - 1];
      set({
        currentBeat: prev,
        isPlaying: true,
        currentTime: 0,
        seekTarget: 0,
        duration: prev.duration
      });
    } else {
      set({ currentTime: 0, seekTarget: 0, isPlaying: true });
    }
  },

  addToQueue: (beat) => {
    const { queue } = get();
    if (!queue.some((b) => b.id === beat.id)) {
      set({ queue: [...queue, beat] });
    }
  },

  toggleRepeat: () => {
    const { repeatMode } = get();
    const modes: ('off' | 'all' | 'one')[] = ['off', 'all', 'one'];
    const nextIndex = (modes.indexOf(repeatMode) + 1) % modes.length;
    set({ repeatMode: modes[nextIndex] });
  },

  setIsQueueOpen: (isQueueOpen) => set({ isQueueOpen }),
  
  toggleQueueOpen: () => set((state) => ({ isQueueOpen: !state.isQueueOpen })),

  setQueue: (queue) => set({ queue }),

  removeFromQueue: (beatId) => {
    const { queue, currentBeat, nextBeat } = get();
    const newQueue = queue.filter((b) => b.id !== beatId);

    // If removing the currently playing beat, jump to next or stop
    if (currentBeat?.id === beatId) {
      if (newQueue.length > 0) {
        nextBeat();
      } else {
        set({ queue: [], currentBeat: null, isPlaying: false });
        return;
      }
    }
    set({ queue: newQueue });
  },

  moveQueueItem: (fromIndex, direction) => {
    const { queue } = get();
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= queue.length) return;

    const newQueue = [...queue];
    const [movedItem] = newQueue.splice(fromIndex, 1);
    newQueue.splice(toIndex, 0, movedItem);
    set({ queue: newQueue });
  },

  reorderQueue: (fromIndex, toIndex) => {
    const { queue } = get();
    if (
      fromIndex < 0 ||
      fromIndex >= queue.length ||
      toIndex < 0 ||
      toIndex >= queue.length ||
      fromIndex === toIndex
    ) {
      return;
    }
    const newQueue = [...queue];
    const [movedItem] = newQueue.splice(fromIndex, 1);
    newQueue.splice(toIndex, 0, movedItem);
    set({ queue: newQueue });
  },

  shuffleQueue: () => {
    const { queue, currentBeat } = get();
    if (queue.length <= 1) return;

    // Keep current beat at the top, shuffle remaining upcoming tracks
    const others = queue.filter((b) => b.id !== currentBeat?.id);
    for (let i = others.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [others[i], others[j]] = [others[j], others[i]];
    }

    const newQueue = currentBeat ? [currentBeat, ...others] : others;
    set({ queue: newQueue });
  },

  clearQueue: () => {
    const { currentBeat } = get();
    set({ queue: currentBeat ? [currentBeat] : [] });
  },

  playFromQueue: (index) => {
    const { queue, catalog } = get();
    if (index < 0 || index >= queue.length) return;
    const targetBeat = queue[index];

    const updatedPlays = (targetBeat.plays || 0) + 1;
    const updatedTarget = { ...targetBeat, plays: updatedPlays };
    const updatedQueue = queue.map((b, i) => (i === index ? updatedTarget : b));
    const updatedCatalog = catalog.map((b) =>
      b.id === targetBeat.id ? { ...b, plays: updatedPlays } : b
    );

    if (typeof window !== 'undefined') {
      fetch('/api/beats/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ beatId: targetBeat.id }),
      }).catch(() => {});
    }

    set({
      currentBeat: updatedTarget,
      isPlaying: true,
      currentTime: 0,
      seekTarget: 0,
      duration: targetBeat.duration,
      queue: updatedQueue,
      catalog: updatedCatalog,
    });
  },

  updateBeatLikes: (beatId: string, isFav: boolean, totalLikes?: number) => {
    const { catalog, queue, currentBeat } = get();
    const cleanId = String(beatId);

    const calcLikes = (current: number) => {
      if (typeof totalLikes === 'number') return totalLikes;
      return isFav ? (current || 0) + 1 : Math.max(0, (current || 1) - 1);
    };

    const newCatalog = catalog.map((b) =>
      b.id === cleanId ? { ...b, likes: calcLikes(b.likes) } : b
    );
    const newQueue = queue.map((b) =>
      b.id === cleanId ? { ...b, likes: calcLikes(b.likes) } : b
    );
    const newCurrent =
      currentBeat && currentBeat.id === cleanId
        ? { ...currentBeat, likes: calcLikes(currentBeat.likes) }
        : currentBeat;

    set({ catalog: newCatalog, queue: newQueue, currentBeat: newCurrent });
  }
}));
