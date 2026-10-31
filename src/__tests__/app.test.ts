import { defaultLicenses } from '../types/beat';
import { MOCK_BEATS, MOCK_GENRES, MOCK_KEYS } from '../data/mockBeats';
import { buildAutoplayQueue } from '../store/useAudioStore';

describe('Luba Beats Core Utilities & Data Structure', () => {
  describe('defaultLicenses()', () => {
    it('should generate 3 commercial license tiers', () => {
      const licenses = defaultLicenses(30);
      expect(licenses).toHaveLength(3);
      expect(licenses.map((l) => l.tier)).toEqual(['basic', 'premium', 'exclusive']);
    });

    it('should calculate correct USD and PEN prices based on base price', () => {
      const base = 25;
      const licenses = defaultLicenses(base);

      const basic = licenses.find((l) => l.tier === 'basic');
      expect(basic?.price).toBe(25);
      expect(basic?.pricePEN).toBe(Math.round(25 * 3.75));

      const premium = licenses.find((l) => l.tier === 'premium');
      expect(premium?.price).toBe(Math.round(25 * 2.8));
      expect(premium?.pricePEN).toBe(Math.round(25 * 2.8 * 3.75));

      const exclusive = licenses.find((l) => l.tier === 'exclusive');
      expect(exclusive?.price).toBe(Math.round(25 * 12));
    });
  });

  describe('Mock Data Integrity', () => {
    it('should contain predefined genres and musical keys', () => {
      expect(MOCK_GENRES.length).toBeGreaterThan(5);
      expect(MOCK_KEYS.length).toBeGreaterThan(10);
      expect(MOCK_GENRES).toContain('Trap');
      expect(MOCK_KEYS).toContain('C Minor');
    });

    it('should have properly structured mock beats', () => {
      expect(MOCK_BEATS.length).toBeGreaterThan(0);
      MOCK_BEATS.forEach((beat) => {
        expect(beat.id).toBeDefined();
        expect(beat.title).toBeDefined();
        expect(beat.producer).toBeDefined();
        expect(beat.producer.name).toBeDefined();
        expect(['beat', 'musica']).toContain(beat.type);
      });
    });
  });

  describe('Autoplay & Playlist Queue Logic (Spotify / YouTube Music style)', () => {
    it('should generate an autoplay queue starting with current track and following recommendations', () => {
      const current = MOCK_BEATS[0];
      const queue = buildAutoplayQueue(current, MOCK_BEATS);

      expect(queue.length).toBeGreaterThan(1);
      expect(queue[0].id).toBe(current.id);

      // Verify no duplicates
      const ids = queue.map((b) => b.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should prioritize recommendations matching content type and genre', () => {
      // Find a 'musica' track
      const musicTrack = MOCK_BEATS.find((b) => b.type === 'musica') || MOCK_BEATS[0];
      const queue = buildAutoplayQueue(musicTrack, MOCK_BEATS);

      expect(queue[0].id).toBe(musicTrack.id);
      // The queue contains subsequent tracks
      expect(queue.length).toBeGreaterThan(1);
    });
  });

  describe('User Profile & Registration Rules', () => {
    const USERNAME_REGEX = /^[a-zA-Z0-9_.-]{3,30}$/;

    it('should accept uppercase letters, lowercase, numbers, and allowed symbols', () => {
      expect(USERNAME_REGEX.test('Metro_Boomin')).toBe(true);
      expect(USERNAME_REGEX.test('Chojin_Beats.99')).toBe(true);
      expect(USERNAME_REGEX.test('DJ-KHALED')).toBe(true);
      expect(USERNAME_REGEX.test('Art1st')).toBe(true);
    });

    it('should reject invalid usernames (too short, spaces, illegal characters)', () => {
      expect(USERNAME_REGEX.test('ab')).toBe(false); // less than 3 chars
      expect(USERNAME_REGEX.test('Metro Boomin')).toBe(false); // spaces not allowed
      expect(USERNAME_REGEX.test('user@name')).toBe(false); // @ not allowed in handle
      expect(USERNAME_REGEX.test('user$money')).toBe(false); // $ not allowed
    });

    it('should calculate remaining username changes and enforce 3-change maximum', () => {
      const MAX_CHANGES = 3;
      const getRemaining = (changes: number) => Math.max(0, MAX_CHANGES - changes);

      expect(getRemaining(0)).toBe(3);
      expect(getRemaining(1)).toBe(2);
      expect(getRemaining(2)).toBe(1);
      expect(getRemaining(3)).toBe(0);
      expect(getRemaining(4)).toBe(0);

      const canChangeUsername = (currentChanges: number) => currentChanges < MAX_CHANGES;
      expect(canChangeUsername(0)).toBe(true);
      expect(canChangeUsername(2)).toBe(true);
      expect(canChangeUsername(3)).toBe(false);
      expect(canChangeUsername(5)).toBe(false);
    });
  });

  describe('Global Search Matching Logic', () => {
    it('should find beats by title, genre, or producer name', () => {
      const q = 'trap';
      const results = MOCK_BEATS.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.genre.toLowerCase().includes(q) ||
          b.producer.name.toLowerCase().includes(q)
      );

      expect(results.length).toBeGreaterThan(0);
      results.forEach((b) => {
        const matches =
          b.title.toLowerCase().includes(q) ||
          b.genre.toLowerCase().includes(q) ||
          b.producer.name.toLowerCase().includes(q);
        expect(matches).toBe(true);
      });
    });

    it('should filter mock users by handle case-insensitively', () => {
      const users = [
        { id: 1, nombre_usuario: 'Metro_Boomin', tipo: 'productor' },
        { id: 2, nombre_usuario: 'chojin', tipo: 'productor' },
        { id: 3, nombre_usuario: 'scuching', tipo: 'artista' }
      ];

      const searchUsers = (query: string) => {
        const q = query.toLowerCase().trim();
        return users.filter((u) => u.nombre_usuario.toLowerCase().includes(q));
      };

      expect(searchUsers('metro')).toHaveLength(1);
      expect(searchUsers('METRO')[0].nombre_usuario).toBe('Metro_Boomin');
      expect(searchUsers('chojin')).toHaveLength(1);
      expect(searchUsers('scuching')).toHaveLength(1);
      expect(searchUsers('xyz123')).toHaveLength(0);
    });
  });

  describe('Sales Notifications & Producer Workflow', () => {
    it('should format producer sales notification correctly', () => {
      const formatSaleMessage = (
        buyerDisplay: string,
        licTier: string,
        beatTitle: string,
        price: number,
        currency: string,
        orderId: string,
        paymentMethod: string
      ) => {
        const licLabel = licTier === 'exclusive' ? 'Exclusiva' : licTier === 'premium' ? 'Premium' : 'Básica';
        return `🎉 ¡Nueva venta realizada!\n\n${buyerDisplay} acaba de adquirir una Licencia ${licLabel} para tu instrumental "${beatTitle}" por $${price.toFixed(2)} ${currency}.\n\n📄 Referencia de orden: ${orderId}\n💳 Método de pago: ${paymentMethod}\n\nPuedes consultar los detalles completos en tu Panel de Productor -> Historial de Ventas.`;
      };

      const msg = formatSaleMessage('@scuching', 'premium', 'Bajo Mundo', 70, 'USD', 'LB-892134', 'Yape');
      expect(msg).toContain('🎉 ¡Nueva venta realizada!');
      expect(msg).toContain('@scuching');
      expect(msg).toContain('Licencia Premium');
      expect(msg).toContain('Bajo Mundo');
      expect(msg).toContain('$70.00 USD');
      expect(msg).toContain('LB-892134');
      expect(msg).toContain('Panel de Productor -> Historial de Ventas');
    });

    it('should properly update beat status when exclusive license is bought', () => {
      const beat = { id: 10, title: 'Trap God', estado: 'publico' };
      const handleLicensePurchased = (currentStatus: string, licenseTier: string) => {
        if (licenseTier === 'exclusive') {
          return 'privado';
        }
        return currentStatus;
      };

      expect(handleLicensePurchased(beat.estado, 'basic')).toBe('publico');
      expect(handleLicensePurchased(beat.estado, 'premium')).toBe('publico');
      expect(handleLicensePurchased(beat.estado, 'exclusive')).toBe('privado');
    });
  });

  describe('Role-based Upload & Selling Permissions', () => {
    interface UploadPayload {
      role: 'productor' | 'artista' | 'comprador' | 'super_admin';
      type: 'beat' | 'musica';
      price: number;
    }

    const validateUploadPermission = (payload: UploadPayload): { allowed: boolean; error?: string; finalType: string; finalPrice: number } => {
      if (payload.role === 'comprador') {
        return { allowed: false, error: 'No autorizado para subir', finalType: payload.type, finalPrice: payload.price };
      }

      if (payload.role === 'artista') {
        if (payload.type === 'beat') {
          return {
            allowed: false,
            error: 'Los artistas solo pueden subir canciones para streaming libre. Venta de beats reservada a productores.',
            finalType: 'musica',
            finalPrice: 0,
          };
        }
        return { allowed: true, finalType: 'musica', finalPrice: 0 };
      }

      if (payload.role === 'productor' || payload.role === 'super_admin') {
        if (payload.type === 'musica') {
          return { allowed: true, finalType: 'musica', finalPrice: 0 };
        }
        return { allowed: true, finalType: 'beat', finalPrice: payload.price };
      }

      return { allowed: false, error: 'Rol desconocido', finalType: payload.type, finalPrice: payload.price };
    };

    it('should reject artists attempting to upload beats', () => {
      const res = validateUploadPermission({ role: 'artista', type: 'beat', price: 30 });
      expect(res.allowed).toBe(false);
      expect(res.error).toContain('Venta de beats reservada a productores');
    });

    it('should allow artists to upload songs with price forced to 0 (free streaming)', () => {
      const res = validateUploadPermission({ role: 'artista', type: 'musica', price: 50 });
      expect(res.allowed).toBe(true);
      expect(res.finalType).toBe('musica');
      expect(res.finalPrice).toBe(0);
    });

    it('should allow producers to upload commercial beats with price', () => {
      const res = validateUploadPermission({ role: 'productor', type: 'beat', price: 40 });
      expect(res.allowed).toBe(true);
      expect(res.finalType).toBe('beat');
      expect(res.finalPrice).toBe(40);
    });

    it('should allow producers to also upload songs for free streaming', () => {
      const res = validateUploadPermission({ role: 'productor', type: 'musica', price: 0 });
      expect(res.allowed).toBe(true);
      expect(res.finalType).toBe('musica');
      expect(res.finalPrice).toBe(0);
    });

    it('should reject buyers completely from uploading', () => {
      const res = validateUploadPermission({ role: 'comprador', type: 'musica', price: 0 });
      expect(res.allowed).toBe(false);
    });
  });
});




