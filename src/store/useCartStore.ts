import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Beat, LicenseOption } from '@/types/beat';

export interface CartItem {
  beat: Beat;
  license: LicenseOption;
}

export interface SimulatedOrderReceipt {
  orderId: string;
  paymentMethod: 'Yape' | 'Plin' | 'Tarjeta (Culqi)' | 'Mercado Pago' | 'Stripe' | 'Efectivo';
  currency: 'PEN' | 'USD';
  amount: number;
  date: string;
  items: {
    beatTitle: string;
    producerName: string;
    licenseName: string;
    downloadUrl: string;
    stemsAvailable: boolean;
  }[];
}

interface CartStore {
  items: CartItem[];
  isCartOpen: boolean;
  isLicenseModalOpen: boolean;
  selectedBeatForLicense: Beat | null;
  isCheckoutModalOpen: boolean;
  receipt: SimulatedOrderReceipt | null;

  addItem: (beat: Beat, license: LicenseOption) => void;
  removeItem: (beatId: string) => void;
  clearCart: () => void;
  setIsCartOpen: (open: boolean) => void;
  openLicenseModal: (beat: Beat) => void;
  closeLicenseModal: () => void;
  setIsCheckoutModalOpen: (open: boolean) => void;
  setReceipt: (receipt: SimulatedOrderReceipt | null) => void;
  getTotalUSD: () => number;
  getTotalPEN: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,
      isLicenseModalOpen: false,
      selectedBeatForLicense: null,
      isCheckoutModalOpen: false,
      receipt: null,

      addItem: (beat, license) => {
        const { items } = get();
        // Replace if already in cart with different license, or add new
        const filtered = items.filter((item) => item.beat.id !== beat.id);
        set({
          items: [...filtered, { beat, license }],
          isLicenseModalOpen: false,
          selectedBeatForLicense: null,
          isCartOpen: true
        });
      },

      removeItem: (beatId) => {
        const { items } = get();
        set({ items: items.filter((item) => item.beat.id !== beatId) });
      },

      clearCart: () => set({ items: [] }),

      setIsCartOpen: (open) => set({ isCartOpen: open }),

      openLicenseModal: (beat) => {
        set({ selectedBeatForLicense: beat, isLicenseModalOpen: true });
      },

      closeLicenseModal: () => {
        set({ selectedBeatForLicense: null, isLicenseModalOpen: false });
      },

      setIsCheckoutModalOpen: (open) => set({ isCheckoutModalOpen: open }),

      setReceipt: (receipt) => set({ receipt }),

      getTotalUSD: () => {
        return Number(
          get()
            .items.reduce((acc, curr) => acc + curr.license.price, 0)
            .toFixed(2)
        );
      },

      getTotalPEN: () => {
        return get().items.reduce((acc, curr) => acc + curr.license.pricePEN, 0);
      }
    }),
    {
      name: 'luba_cart_store',
      partialize: (state) => ({ items: state.items, receipt: state.receipt }),
    }
  )
);
