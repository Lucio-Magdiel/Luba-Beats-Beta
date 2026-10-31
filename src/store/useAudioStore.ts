import { create } from 'zustand';
import { Beat } from '@/types/beat';
import { MOCK_BEATS } from '@/data/mockBeats';

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
  catalog: MOCK_BEATS,

  initCatalog: async () => {
    try {
      if (typeof window === 'undefined') return;
      const res = await fetch('/api/beats');
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.beats) && data.beats.length > 0) {
        // Merge DB beats with MOCK_BEATS without duplicate IDs
        const existingIds = new Set(data.beats.map((b: Beat) => b.id));
        const combined = [
          ...data.beats,
          ...MOCK_BEATS.filter((b) => !existingIds.has(b.id))
        ];
        set({ catalog: combined });
      }
    } catch (err) {
      console.warn('Could not fetch catalog from API, using defaults:', err);
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

    set({
      currentBeat: beat,
      isPlaying: true,
      currentTime: 0,
      duration: beat.duration,
      seekTarget: 0,
      queue: finalQueue
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
  }
}));
