import { create } from 'zustand';

export interface CartItem {
    cart_item_id: string;
    id?: string;
    name: string;
    price: number;
    precio_base?: number;
    quantity: number;
    image_url?: string;
    categoria_slug?: string;
    subcategoria_id?: number;
    subcategoria_especial?: string;
    type_color?: string;
    genero?: string;
    modelo?: string;
    cinta?: string;
    adicionales?: string[];
    recargo_adicionales?: number;
    // Personalization details
    is_personalizado?: boolean;
    nombre_personalizado?: string;
    especialidad_personalizada?: string;
    color_preferencia?: string;
    detalles_personalizados?: string;
    texto_personalizado?: string;
    imagenes_personalizadas?: string[];
    // Stock & Encargo tracking (for Accesorios & Equipos Médicos)
    es_por_encargo?: boolean;
    stock_disponible?: number;
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
        
        const newAdicionalesKey = (newItem.adicionales || []).slice().sort().join('|');
        const existingIndex = state.items.findIndex((item) => {
            const itemAdicionalesKey = (item.adicionales || []).slice().sort().join('|');
            return (
                item.id === newItem.id && 
                !item.is_personalizado &&
                item.type_color === newItem.type_color &&
                item.genero === newItem.genero &&
                item.modelo === newItem.modelo &&
                item.subcategoria_especial === newItem.subcategoria_especial &&
                itemAdicionalesKey === newAdicionalesKey
            );
        });
        if (existingIndex > -1) {
            const newItems = [...state.items];
            const currentItem = newItems[existingIndex];
            const stockDisp = newItem.stock_disponible !== undefined ? newItem.stock_disponible : currentItem.stock_disponible;
            const isEphemeralStock =
                (currentItem.categoria_slug === 'gorros' && Number(currentItem.subcategoria_id) === 70) ||
                (currentItem.categoria_slug === 'lanyards' && Number(currentItem.subcategoria_id) === 5);
            const rawUpdatedQty = currentItem.quantity + (newItem.quantity || 1);
            const updatedQty = isEphemeralStock && stockDisp !== undefined
                ? Math.min(Math.max(1, stockDisp), rawUpdatedQty)
                : rawUpdatedQty;
            const isEncargoCat =
                currentItem.categoria_slug === 'accesorios-medicos' ||
                currentItem.categoria_slug === 'equipos-medicos' ||
                (currentItem.categoria_slug === 'lanyards' && Number(currentItem.subcategoria_id) === 7);
            newItems[existingIndex] = {
                ...currentItem,
                quantity: updatedQty,
                stock_disponible: stockDisp,
                es_por_encargo: isEncargoCat && stockDisp !== undefined
                    ? (stockDisp <= 0 || updatedQty > stockDisp)
                    : currentItem.es_por_encargo
            };
            return { items: newItems };
        }
        return { items: [...state.items, { ...newItem, quantity: newItem.quantity || 1 }] };
    }),
    removeItem: (cart_item_id) => set((state) => ({
        items: state.items.filter((item) => item.cart_item_id !== cart_item_id),
    })),
    updateQuantity: (cart_item_id, quantity) => set((state) => ({
        items: state.items.map((item) => {
            if (item.cart_item_id !== cart_item_id) return item;
            const isEphemeralStock =
                (item.categoria_slug === 'gorros' && Number(item.subcategoria_id) === 70) ||
                (item.categoria_slug === 'lanyards' && Number(item.subcategoria_id) === 5);
            const safeQty = isEphemeralStock && item.stock_disponible !== undefined
                ? Math.min(Math.max(1, item.stock_disponible), Math.max(1, quantity))
                : Math.max(1, quantity);
            const isEncargoCat =
                item.categoria_slug === 'accesorios-medicos' ||
                item.categoria_slug === 'equipos-medicos' ||
                (item.categoria_slug === 'lanyards' && Number(item.subcategoria_id) === 7);
            const esPorEncargo = isEncargoCat && item.stock_disponible !== undefined
                ? (item.stock_disponible <= 0 || safeQty > item.stock_disponible)
                : item.es_por_encargo;
            return { ...item, quantity: safeQty, es_por_encargo: esPorEncargo };
        }),
    })),
    clearCart: () => set({ items: [] }),
}));
