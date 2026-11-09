// ============================================================================
// CONFIGURACIÓN CENTRALIZADA DEL HERO & PRELOADER — BOHEME
// ============================================================================
// Todo el contenido (textos, palabras rotativas, imágenes, enlaces, stickers y
// sistema de motion) vive en este archivo para poder reutilizar la tienda o
// reemplazar fotografías y textos sin tocar los componentes de código.
// ============================================================================

export interface HeroMotionSystem {
    easings: {
        /** Curva principal para entradas de texto, tarjetas y máscaras */
        reveal: string;
        /** Curva dramática para el barrido del logo y apertura del telón de carga */
        curtain: string;
        /** Curva con micro-elasticidad controlada para stickers y detalle sorpresa */
        playful: string;
    };
    durations: {
        /** Micro-interacciones, cambio de palabra rotativa y estados hover/tap (s) */
        fast: number;
        /** Entrada de bloques tipográficos, subtítulo, botones y tarjetas (s) */
        base: number;
        /** Secuencias largas: barrido del logo en preloader y telón (s) */
        slow: number;
    };
    /** Escalonado (stagger) entre elementos de la secuencia de entrada (60ms - 120ms) */
    stagger: number;
}

export interface HeroShowcaseCardConfig {
    id: string;
    /**
     * [REEMPLAZAR AQUÍ CON TU FOTO REAL]
     * Soporta tanto fotos con fondo recortado (PNG/WebP transparente) como fotos normales.
     */
    imageSrc: string;
    imageAlt: string;
    /** 'cover' para fotos con fondo completo, 'contain' si usas PNG recortado sin fondo */
    imageFit: 'cover' | 'contain';
    badge: string;
    title: string;
    subtitle: string;
    priceTag: string;
    href: string;
    accentColor: 'terracotta' | 'wine' | 'peach';
}

export interface HeroConfig {
    motion: HeroMotionSystem;
    preloader: {
        enabled: boolean;
        /**
         * [REEMPLAZAR SI DESEAS OTRO LOGO EN LA PANTALLA DE CARGA]
         * Por defecto usa el logo blanco oficial de BOHEME sobre el telón ciruela/terracota.
         */
        logoSrc: string;
        logoAlt: string;
        /** Width & height explícitos para evitar saltos de layout (CLS = 0) */
        logoWidth: number;
        logoHeight: number;
        /**
         * [REEMPLAZAR AQUÍ CON TU IMAGEN DE FONDO DE CARGA]
         * Imagen temática que aparece desenfocada detrás del logo durante la carga.
         */
        backgroundImageSrc: string;
        backgroundImageAlt: string;
        topBadgeText: string;
        loadingStatusText: string;
    };
    colors: {
        wine: string;
        terracotta: string;
        peach: string;
        creamBg: string;
        cardBg: string;
        whatsappGreen: string;
    };
    content: {
        topBadge: string;
        titlePrefix: string;
        /**
         * Palabras que rotan suavemente en el título principal.
         * El contenedor reserva el ancho de la palabra más larga para evitar saltos.
         */
        rotatingWords: string[];
        /** Intervalo entre cada palabra rotativa en milisegundos */
        rotatingIntervalMs: number;
        titleConnector: string;
        titleBrand: string;
        /** Texto completo leído por lectores de pantalla en el H1 */
        accessibleFullTitle: string;
        subtitle: string;
        trustPills: Array<{
            icon: 'sparkles' | 'shield' | 'truck';
            text: string;
        }>;
    };
    ctas: {
        primary: {
            label: string;
            href: string;
        };
        secondary: {
            label: string;
            whatsappNumber: string;
            defaultWhatsappMessage: string;
        };
    };
    visuals: {
        /** Tarjeta protagonista del collage a la derecha */
        mainCard: HeroShowcaseCardConfig;
        /** Tarjetas secundarias flotantes que acompañan al producto principal */
        satelliteCards: [HeroShowcaseCardConfig, HeroShowcaseCardConfig];
        /** Tarjeta de sello de garantía (inspirada en la brandCard de la referencia) */
        brandPromiseCard: {
            title: string;
            quote: string;
            locationLabel: string;
            locationHighlight: string;
        };
    };
    stickers: {
        qualityStamp: {
            topLine: string;
            middleLine: string;
            bottomLine: string;
            ariaLabel: string;
            surpriseMessages: string[];
        };
        washiNote: string;
        newCollectionTag: string;
        scrollIndicatorLabel: string;
    };
}

export const HERO_CONFIG: HeroConfig = {
    // 1. Sistema de Motion (3 easings y 3 duraciones consistentes)
    motion: {
        easings: {
            reveal: 'power3.out',
            curtain: 'power4.inOut',
            playful: 'back.out(1.6)',
        },
        durations: {
            fast: 0.38,
            base: 0.78,
            slow: 2.2,
        },
        stagger: 0.09, // 90 ms (dentro del rango 60-120 ms)
    },

    // 2. Pantalla de Carga (Preloader con barrido luminoso del logo de BOHEME)
    preloader: {
        enabled: true,
        logoSrc: '/logo-white.png', // [PLACEHOLDER LOGO CARGA] Puedes cambiarlo por '/logo-peach.png' o '/logo.png'
        logoAlt: 'BOHEME — Indumentaria y Accesorios Médicos',
        logoWidth: 300,
        logoHeight: 96,
        backgroundImageSrc: '/hero_bg.png', // [PLACEHOLDER FONDO CARGA] Reemplazar por foto de taller o quirófano
        backgroundImageAlt: 'Atelier de confección y accesorios médicos BOHEME',
        topBadgeText: 'ATELIER & TIENDA MÉDICA • VENEZUELA',
        loadingStatusText: 'Preparando tu guardia con color & buena onda...',
    },

    // 3. Tokens de Color de Marca
    colors: {
        wine: '#5F2142',
        terracotta: '#D86A33',
        peach: '#FFC99C',
        creamBg: '#FFF9F5',
        cardBg: '#FFFFFF',
        whatsappGreen: '#25D366',
    },

    // 4. Textos y Palabras Rotativas del Hero
    content: {
        topBadge: 'Accesorios con Estilo & Confort',
        titlePrefix: 'Ponle',
        rotatingWords: ['color', 'buena onda', 'tu estilo', 'alegría'],
        rotatingIntervalMs: 2800,
        titleConnector: 'a tu jornada con',
        titleBrand: 'BOHEME',
        accessibleFullTitle: 'Ponle color, estilo y buena onda a tu jornada con BOHEME',
        subtitle:
            'Gorritos quirúrgicos, lanyards personalizados, accesorios y equipos médicos creados con dedicación artesanal para acompañarte en cada guardia.',
        trustPills: [
            { icon: 'sparkles', text: 'Personalizados a tu medida' },
            { icon: 'truck', text: 'Envíos a toda Venezuela' },
        ],
    },

    // 5. Llamados a la Acción (CTAs)
    ctas: {
        primary: {
            label: 'Explorar catálogo',
            href: '/categorias/gorros',
        },
        secondary: {
            label: 'Pedir por WhatsApp',
            whatsappNumber: '584121409976',
            defaultWhatsappMessage:
                '¡Hola BOHEME! 🌸 Vengo de la web y me gustaría consultar por sus gorros quirúrgicos y accesorios personalizados.',
        },
    },

    // 6. Imágenes del Collage Editorial (con rutas de placeholder claramente marcadas)
    visuals: {
        mainCard: {
            id: 'hero-main-gorros',
            // [PLACEHOLDER IMAGEN PRINCIPAL] -> Pon aquí tu foto estrella (ej. '/hero/gorro-estrella.webp' o PNG sin fondo)
            imageSrc: '/cat_gorros.png',
            imageAlt: 'Gorros quirúrgicos personalizados BOHEME con diseños exclusivos',
            imageFit: 'cover',
            badge: '★ TOP VENTAS EN GUARDIA',
            title: 'Gorros Quirúrgicos',
            subtitle: 'Dama & Caballero • Ajuste perfecto',
            priceTag: 'Desde $8.00',
            href: '/categorias/gorros',
            accentColor: 'terracotta',
        },
        satelliteCards: [
            {
                id: 'hero-sat-lanyards',
                // [PLACEHOLDER IMAGEN SECUNDARIA 1] -> Pon aquí tu foto de Lanyards / Portacarnets
                imageSrc: '/cat_accesorios.png',
                imageAlt: 'Lanyards sublimados y accesorios médicos personalizados BOHEME',
                imageFit: 'cover',
                badge: '✦ PERSONALIZADOS',
                title: 'Lanyards',
                subtitle: 'Con tu nombre y especialidad',
                priceTag: 'Desde $3.00',
                href: '/categorias/lanyards',
                accentColor: 'wine',
            },
            {
                id: 'hero-sat-equipos',
                // [PLACEHOLDER IMAGEN SECUNDARIA 2] -> Pon aquí tu foto de Equipos Médicos
                imageSrc: '/cat_equipos.png',
                imageAlt: 'Equipos médicos profesionales: estetoscopios, tensiómetros y oxímetros',
                imageFit: 'cover',
                badge: '✦ PRECISIÓN CLÍNICA',
                title: 'Equipos Médicos',
                subtitle: 'Estetoscopios & tensiómetros',
                priceTag: 'Garantizados',
                href: '/categorias/equipos-medicos',
                accentColor: 'peach',
            },
        ],
        brandPromiseCard: {
            title: 'Sello Artesanal & Clínico',
            quote: 'Cada pieza se confecciona cuidando cada costura para que tu turno refleje tu esencia profesional.',
            locationLabel: 'Envíos Nacionales & Locales:',
            locationHighlight: 'Coro, La Vela y toda Venezuela',
        },
    },

    // 7. Stickers Flotantes y Detalle Sorpresa Interactivo
    stickers: {
        qualityStamp: {
            topLine: '✦ 100% ✦',
            middleLine: 'CALIDAD',
            bottomLine: 'BOHEME',
            ariaLabel: 'Sello interactivo 100% Calidad BOHEME. Tócalo para activar buena onda en tu guardia',
            surpriseMessages: [
                '¡Buena onda activada para tu guardia! ✨🩺',
                '¡Que tengas un turno lleno de éxitos y color! 🌸💖',
                '¡Hecho a mano con amor para grandes profesionales! 🧵✨',
                '¡Tu estilo ilumina todo el quirófano! 🌟🏥',
            ],
        },
        washiNote: '★ HECHO A LA MEDIDA ★',
        newCollectionTag: 'NUEVA COLECCIÓN',
        scrollIndicatorLabel: 'Explora nuestras categorías',
    },
};
