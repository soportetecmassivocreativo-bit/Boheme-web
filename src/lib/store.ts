import { create } from 'zustand';

export interface CartItem {
    cart_item_id: string;
    id?: string;
    name: string;
    price: number;
    quantity: number;
    image_url?: string;
    categoria_slug?: string;
    type_color?: string;
    genero?: string;
    modelo?: string;
    cinta?: string;
    // Personalization details
    is_personalizado?: boolean;
    nombre_personalizado?: string;
    especialidad_personalizada?: string;
    color_preferencia?: string;
    detalles_personalizados?: string;
    texto_personalizado?: string;
    imagenes_personalizadas?: string[];
}

interface CartStore {
    items: CartItem[];
    isOpen: boolean;
    isCheckoutOpen: boolean;
    toggleCart: () => void;
    toggleCheckout: () => void;
    setCheckoutOpen: (open: boolean) => void;
    addItem: (item: CartItem) => void;
    removeItem: (cart_item_id: string) => void;
    updateQuantity: (cart_item_id: string, quantity: number) => void;
    clearCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
    items: [],
    isOpen: false,
    isCheckoutOpen: false,
    toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
    toggleCheckout: () => set((state) => ({ isCheckoutOpen: !state.isCheckoutOpen })),
    setCheckoutOpen: (open) => set({ isCheckoutOpen: open }),
    addItem: (newItem) => set((state) => {
        // If it's a personalized item, keep it as an individual item instance
        if (newItem.is_personalizado) {
            return { items: [...state.items, { ...newItem, quantity: newItem.quantity || 1 }] };
        }
        
        const existingIndex = state.items.findIndex((item) => 
            item.id === newItem.id && 
            !item.is_personalizado &&
            item.type_color === newItem.type_color
        );
        if (existingIndex > -1) {
            const newItems = [...state.items];
            newItems[existingIndex].quantity += (newItem.quantity || 1);
            return { items: newItems };
        }
        return { items: [...state.items, { ...newItem, quantity: newItem.quantity || 1 }] };
    }),
    removeItem: (cart_item_id) => set((state) => ({
        items: state.items.filter((item) => item.cart_item_id !== cart_item_id),
    })),
    updateQuantity: (cart_item_id, quantity) => set((state) => ({
        items: state.items.map((item) => item.cart_item_id === cart_item_id ? { ...item, quantity } : item),
    })),
    clearCart: () => set({ items: [] }),
}));
