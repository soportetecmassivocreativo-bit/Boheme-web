import { create } from 'zustand';

export interface CartItem {
    cart_item_id: string;
    id?: string;
    name: string;
    price: number;
    quantity: number;
    image_url?: string;
    type_color?: string;
    genero?: string;
    modelo?: string;
    cinta?: string;
    texto_personalizado?: string;
    imagenes_personalizadas?: string[];
}

interface CartStore {
    items: CartItem[];
    isOpen: boolean;
    toggleCart: () => void;
    addItem: (item: CartItem) => void;
    removeItem: (cart_item_id: string) => void;
    updateQuantity: (cart_item_id: string, quantity: number) => void;
    clearCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
    items: [],
    isOpen: false,
    toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
    addItem: (newItem) => set((state) => {
        const existingIndex = state.items.findIndex((item) => item.cart_item_id === newItem.cart_item_id);
        if (existingIndex > -1) {
            const newItems = [...state.items];
            newItems[existingIndex].quantity += 1;
            return { items: newItems };
        }
        return { items: [...state.items, { ...newItem, quantity: 1 }] };
    }),
    removeItem: (cart_item_id) => set((state) => ({
        items: state.items.filter((item) => item.cart_item_id !== cart_item_id),
    })),
    updateQuantity: (cart_item_id, quantity) => set((state) => ({
        items: state.items.map((item) => item.cart_item_id === cart_item_id ? { ...item, quantity } : item),
    })),
    clearCart: () => set({ items: [] }),
}));