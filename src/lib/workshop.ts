import { Order, OrderItem } from './db';

export type WorkshopProductType = 
    | 'gorros_personalizados'
    | 'gorros_especiales'
    | 'gorros_basicos'
    | 'lanyards_personalizados'
    | 'productos_personalizados'
    | 'resto_local'
    | 'resto_nacional';

export interface WorkshopStage {
    key: string;
    label: string;
    shortLabel: string;
    icon: string;
    color: string;
    badgeBg: string;
    description: string;
}

export const WORKSHOP_STAGES: Record<string, WorkshopStage> = {
    pedido_solicitado: {
        key: 'pedido_solicitado',
        label: 'Pedido Solicitado',
        shortLabel: 'Solicitado',
        icon: '📋',
        color: 'text-blue-700 dark:text-blue-300',
        badgeBg: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        description: 'Pedido registrado en el sistema, en espera de inicio de taller.'
    },
    por_disenar: {
        key: 'por_disenar',
        label: 'Por Diseñar',
        shortLabel: 'Por Diseñar',
        icon: '🎨',
        color: 'text-amber-700 dark:text-amber-300',
        badgeBg: 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        description: 'Requiere preparación de arte digital, patrones o tipografía personalizada.'
    },
    diseno_aprobado: {
        key: 'diseno_aprobado',
        label: 'Diseño Aprobado',
        shortLabel: 'Diseño OK',
        icon: '📐',
        color: 'text-indigo-700 dark:text-indigo-300',
        badgeBg: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
        description: 'Diseño validado y listo para pasar a impresión/sublimación.'
    },
    en_imprenta: {
        key: 'en_imprenta',
        label: 'En Imprenta',
        shortLabel: 'Imprenta',
        icon: '🖨️',
        color: 'text-purple-700 dark:text-purple-300',
        badgeBg: 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        description: 'En proceso de estampado, sublimación o corte de cintas/telas.'
    },
    por_coser: {
        key: 'por_coser',
        label: 'Por Coser',
        shortLabel: 'Por Coser',
        icon: '🧵',
        color: 'text-pink-700 dark:text-pink-300',
        badgeBg: 'bg-pink-100 dark:bg-pink-900/40 text-pink-800 dark:text-pink-300 border-pink-200 dark:border-pink-800',
        description: 'En mesa de confección, costura de gorro, dobladillo y elásticos.'
    },
    por_embalar: {
        key: 'por_embalar',
        label: 'Por Embalar',
        shortLabel: 'Por Embalar',
        icon: '📦',
        color: 'text-orange-700 dark:text-orange-300',
        badgeBg: 'bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800',
        description: 'Empaque especial para envío nacional con precintos de seguridad.'
    },
    por_enviar: {
        key: 'por_enviar',
        label: 'Por Enviar',
        shortLabel: 'Por Enviar',
        icon: '🚚',
        color: 'text-cyan-700 dark:text-cyan-300',
        badgeBg: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
        description: 'Listo para despacho en agencia nacional (MRW, Zoom, Tealca).'
    },
    enviado: {
        key: 'enviado',
        label: 'Enviado',
        shortLabel: 'Enviado',
        icon: '✈️',
        color: 'text-teal-700 dark:text-teal-300',
        badgeBg: 'bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800',
        description: 'Paquete despachado con número de guía registrado.'
    },
    por_entregar: {
        key: 'por_entregar',
        label: 'Por Entregar',
        shortLabel: 'Por Entregar',
        icon: '🛍️',
        color: 'text-emerald-700 dark:text-emerald-300',
        badgeBg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        description: 'Listo para entrega local en Municipio Miranda o Municipio Colina.'
    },
    entregado: {
        key: 'entregado',
        label: 'Entregado',
        shortLabel: 'Entregado',
        icon: '✅',
        color: 'text-green-700 dark:text-green-300',
        badgeBg: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800',
        description: 'Pedido recibido a satisfacción por el cliente.'
    }
};

/**
 * Determine the specific workshop category for an individual item
 */
export function determineItemWorkshopType(item: OrderItem, orderDeliveryType: 'local' | 'nacional' = 'local'): WorkshopProductType {
    const nameLower = (item.name || '').toLowerCase();
    const cat = (item.categoria_slug || '').toLowerCase();
    const hasCustomDetails = Boolean(item.is_personalizado || item.nombre_personalizado || item.especialidad_personalizada || item.detalles_personalizados);

    // 1. Gorros
    if (cat === 'gorros' || nameLower.includes('gorro')) {
        if (hasCustomDetails || nameLower.includes('personaliz')) {
            return 'gorros_personalizados';
        }
        if (nameLower.includes('especial')) {
            return 'gorros_especiales';
        }
        return 'gorros_basicos';
    }

    // 2. Lanyards
    if (cat === 'lanyards' || nameLower.includes('lanyard') || nameLower.includes('cinta')) {
        if (hasCustomDetails || nameLower.includes('personaliz')) {
            return 'lanyards_personalizados';
        }
    }

    // 3. Productos personalizados generales
    if (hasCustomDetails || cat === 'productos-personalizados' || nameLower.includes('personaliz')) {
        return 'productos_personalizados';
    }

    // 4. Resto de productos
    return orderDeliveryType === 'nacional' ? 'resto_nacional' : 'resto_local';
}

/**
 * Determine the overall primary workshop product type for an order
 */
export function getOrderWorkshopType(order: Order): WorkshopProductType {
    if (!order.items || order.items.length === 0) {
        return order.tipo_entrega === 'nacional' ? 'resto_nacional' : 'resto_local';
    }

    const types = order.items.map(it => determineItemWorkshopType(it, order.tipo_entrega));

    // Priority hierarchy for the overall order pipeline:
    if (types.includes('gorros_personalizados')) return 'gorros_personalizados';
    if (types.includes('gorros_especiales')) return 'gorros_especiales';
    if (types.includes('productos_personalizados')) return 'productos_personalizados';
    if (types.includes('lanyards_personalizados')) return 'lanyards_personalizados';
    if (types.includes('gorros_basicos')) return 'gorros_basicos';
    
    return order.tipo_entrega === 'nacional' ? 'resto_nacional' : 'resto_local';
}

/**
 * Returns human-readable label for a workshop type
 */
export function getWorkshopTypeLabel(type: WorkshopProductType): string {
    switch (type) {
        case 'gorros_personalizados': return 'Gorrito Personalizado';
        case 'gorros_especiales': return 'Gorro Especial';
        case 'gorros_basicos': return 'Gorrito Básico';
        case 'lanyards_personalizados': return 'Lanyard Personalizado';
        case 'productos_personalizados': return 'Producto Personalizado';
        case 'resto_nacional': return 'Stock (Envío Nacional)';
        case 'resto_local': return 'Stock (Municipio Miranda / Colina)';
        default: return 'Producto Taller';
    }
}

/**
 * Get ordered step keys for an order based on product type and delivery mode
 */
export function getOrderWorkflowSteps(order: Order): string[] {
    const type = getOrderWorkshopType(order);
    const isNacional = order.tipo_entrega === 'nacional';

    switch (type) {
        case 'gorros_personalizados':
        case 'gorros_especiales':
        case 'productos_personalizados':
            if (isNacional) {
                // Production + National Shipping stages
                return ['por_disenar', 'diseno_aprobado', 'en_imprenta', 'por_coser', 'por_embalar', 'por_enviar', 'enviado', 'entregado'];
            }
            return ['por_disenar', 'diseno_aprobado', 'en_imprenta', 'por_coser', 'por_entregar', 'entregado'];

        case 'gorros_basicos':
            if (isNacional) {
                return ['por_coser', 'por_embalar', 'por_enviar', 'enviado', 'entregado'];
            }
            return ['por_coser', 'por_entregar', 'entregado'];

        case 'lanyards_personalizados':
            if (isNacional) {
                return ['por_disenar', 'diseno_aprobado', 'en_imprenta', 'por_embalar', 'por_enviar', 'enviado', 'entregado'];
            }
            return ['por_disenar', 'diseno_aprobado', 'en_imprenta', 'por_entregar', 'entregado'];

        case 'resto_nacional':
            return ['pedido_solicitado', 'por_embalar', 'por_enviar', 'enviado', 'entregado'];

        case 'resto_local':
        default:
            return ['pedido_solicitado', 'por_entregar', 'entregado'];
    }
}

/**
 * Return default starting workshop status for a new order
 */
export function getDefaultWorkshopStatus(items: OrderItem[] = [], tipoEntrega: 'local' | 'nacional' = 'local'): string {
    const mockOrder: any = { items, tipo_entrega: tipoEntrega };
    const steps = getOrderWorkflowSteps(mockOrder);
    return steps[0] || 'pedido_solicitado';
}

/**
 * Get stage info safely
 */
export function getStageInfo(key: string): WorkshopStage {
    return WORKSHOP_STAGES[key] || {
        key,
        label: key.replace(/_/g, ' '),
        shortLabel: key.replace(/_/g, ' '),
        icon: '📌',
        color: 'text-gray-700 dark:text-gray-300',
        badgeBg: 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10',
        description: 'Estatus del pedido en taller.'
    };
}
