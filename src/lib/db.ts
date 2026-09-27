import { supabase, isSupabaseConfigured } from './supabase';

export interface Subcategory {
    id: number;
    name: string;
}

export interface CategoryInfo {
    id: string;
    title: string;
    description: string;
    subcategories: Subcategory[];
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    categoria_slug: string;
    subcategoria_id?: number;
    type_color?: string;
    genero?: string;
    modelo?: string;
    cinta?: string;
}

// Category Configuration mapped exactly to production slug URLs
export const CATEGORIES: Record<string, CategoryInfo> = {
    'gorros': {
        id: 'gorros',
        title: 'Gorros',
        description: 'Explora nuestra colección de gorros diseñados para brindarte confort y estilo en tu labor diaria.',
        subcategories: [
            { id: 70, name: 'Gorritos en stock' },
            { id: 71, name: 'Gorritos personalizados' }
        ]
    },
    'lanyards': {
        id: 'lanyards',
        title: 'Lanyards',
        description: 'Explora nuestra colección de lanyards diseñados para brindarte confort y estilo en tu labor diaria.',
        subcategories: [
            { id: 5, name: 'Lanyards Básicos' },
            { id: 6, name: 'Lanyards personalizados' },
            { id: 7, name: 'Portacarnet transparente' }
        ]
    },
    'accesorios-medicos': {
        id: 'accesorios-medicos',
        title: 'Accesorios médicos',
        description: 'Explora nuestra colección de accesorios médicos diseñados para brindarte confort y estilo en tu labor diaria.',
        subcategories: [
            { id: 8, name: 'Cintas metricas' },
            { id: 9, name: 'Adipometro' },
            { id: 10, name: 'Calculadora portatil' },
            { id: 11, name: 'Calculadora llavero' },
            { id: 12, name: 'Tabla portadocumentos' },
            { id: 13, name: 'Caliper' },
            { id: 14, name: 'Diapason' },
            { id: 15, name: 'Martillo neurologico taylor' },
            { id: 16, name: 'Martillo neurologico Buck' },
            { id: 17, name: 'Estuche estetoscopio' },
            { id: 18, name: 'Goniometro' },
            { id: 19, name: 'Atomizador alcohol portatil' },
            { id: 20, name: 'Atomizador de perfume' },
            { id: 21, name: 'Koala medico Maxi' },
            { id: 22, name: 'Koala medico clásico' },
            { id: 23, name: 'Koala enfermeria (riñonera)' },
            { id: 24, name: 'Kit de sutura (cirugia menor)' },
            { id: 25, name: 'Pad de practica sutura' },
            { id: 26, name: 'Toniquete automatico' },
            { id: 27, name: 'Torniquete liga' },
            { id: 28, name: 'Rompeampolla básico' },
            { id: 29, name: 'Rompeampolla animado' },
            { id: 30, name: 'Rompeampolla silicon' },
            { id: 31, name: 'Llaveros animados salud' },
            { id: 32, name: 'Tijera de trauma' },
            { id: 33, name: 'Tinta para sello' },
            { id: 34, name: 'Pines para bata' },
            { id: 35, name: 'Pines estetoscopio' },
            { id: 36, name: 'Estuche oximetro' },
            { id: 37, name: 'Mesa para laptop' }
        ]
    },
    'equipos-medicos': {
        id: 'equipos-medicos',
        title: 'Equipos médicos',
        description: 'Explora nuestra colección de equipos médicos diseñados para brindarte confort y estilo en tu labor diaria.',
        subcategories: [
            { id: 38, name: 'Tensiometro manual básico color (negro)' },
            { id: 39, name: 'Tensiometro manual doble campana colores' },
            { id: 40, name: 'Tensiometro digital de brazalete' },
            { id: 41, name: 'Tensiometro digital de muñeca' },
            { id: 42, name: 'Otoscopio basico' },
            { id: 43, name: 'Otoscopio profesional' },
            { id: 44, name: 'Estetoscopio básico' },
            { id: 45, name: 'Estetoscopio doble campana' },
            { id: 46, name: 'Doppler fetal portatil' },
            { id: 47, name: 'Linterna frontal' },
            { id: 48, name: 'Linterna pupilar' },
            { id: 49, name: 'Glucometro' },
            { id: 50, name: 'Oximetro adulto básico' },
            { id: 51, name: 'Oximetro adulto recargable' },
            { id: 52, name: 'Oximetro pediatrico' },
            { id: 53, name: 'Nebulizador portatil' },
            { id: 54, name: 'Nebulizador de compresor' },
            { id: 55, name: 'Termometro digital animado' },
            { id: 56, name: 'Termometro digital basico' }
        ]
    },
    'productos-personalizados': {
        id: 'productos-personalizados',
        title: 'Productos personalizados',
        description: 'Explora nuestra colección de productos personalizados diseñados para brindarte confort y estilo en tu labor diaria.',
        subcategories: [
            { id: 57, name: 'Franelas con estampado DTF' },
            { id: 58, name: 'Llaveros acrílicos' },
            { id: 59, name: 'Peluches' },
            { id: 60, name: 'Cojines' },
            { id: 61, name: 'Cartucheras' },
            { id: 62, name: 'Delantales' },
            { id: 63, name: 'Pañoletas' },
            { id: 64, name: 'Totebag' },
            { id: 65, name: 'Fotos polaroid' },
            { id: 66, name: 'Minilibretas' }
        ]
    }
};

// Static Mock Products matching production data
const MOCK_PRODUCTS: Product[] = [
    {
        id: '1',
        name: 'Cinta Métrica Retractil',
        description: 'Basica | Largo: 150cm Colores variados (Consultar)',
        price: 2,
        image_url: '/cat_accesorios.png', // Fallback to category image
        categoria_slug: 'accesorios-medicos',
        subcategoria_id: 8
    },
    {
        id: '2',
        name: 'Adipometro',
        description: 'Plastico | Generico. Instrumento para la medición del porcentaje de grasa corporal. Rango de Medición: 0-70mm. Colores: Negro, Blanco y Rosado',
        price: 5,
        image_url: '/cat_accesorios.png',
        categoria_slug: 'accesorios-medicos',
        subcategoria_id: 9
    },
    {
        id: '3',
        name: 'Calculadora Portatil Casio',
        description: 'Modelo Casio. Colores: Negro, Rosado, Blanco, Azul. Medidas: 11,8×6,9×1,8cm',
        price: 8,
        image_url: '/cat_accesorios.png',
        categoria_slug: 'accesorios-medicos',
        subcategoria_id: 10
    },
    {
        id: '4',
        name: 'Calculadora Portatil Economica',
        description: 'Modelo sencillo y funcional. Color: Negro',
        price: 4,
        image_url: '/cat_accesorios.png',
        categoria_slug: 'accesorios-medicos',
        subcategoria_id: 10
    },
    {
        id: '5',
        name: 'Mini Calculadora Llavero',
        description: 'Colores varían según disponibilidad (Consultar). Tamaño: 5,5x8,6x0,8cm',
        price: 3,
        image_url: '/cat_accesorios.png',
        categoria_slug: 'accesorios-medicos',
        subcategoria_id: 11
    },
    {
        id: '6',
        name: 'Carpeta Portadocumento Básica',
        description: 'Apertura frontal. Colores: Variados (Consultar disponibilidad). Tamaño: A4 (23,7X36cm). Capacidad: 100 hojas',
        price: 5,
        image_url: '/cat_accesorios.png',
        categoria_slug: 'accesorios-medicos',
        subcategoria_id: 12
    },
    {
        id: '7',
        name: 'Carpeta Portadocumento Con Almacenamiento',
        description: 'Apertura Lateral. Modelo con almacenamiento inferior. Colores: Variados. Tamaño: Carta',
        price: 8,
        image_url: '/cat_accesorios.png',
        categoria_slug: 'accesorios-medicos',
        subcategoria_id: 12
    },
    {
        id: '8',
        name: 'Caliper EKG Profesional',
        description: 'Instrumento de precisión para medir intervalos y distancias entre ondas en un electrocardiograma. Colores: Negro, rosado, azul (Consultar Disponibilidad). Tamaño: 12cm de largo.',
        price: 10,
        image_url: '/cat_accesorios.png',
        categoria_slug: 'accesorios-medicos',
        subcategoria_id: 13
    },
    {
        id: '9',
        name: 'Diapason Unidad | 128 HZ',
        description: 'Con Sordina. Colores: Plateado, Dorado, Azul, Rosado. Incluye martillo. Tamaño: 17,5cm',
        price: 12,
        image_url: '/cat_accesorios.png',
        categoria_slug: 'accesorios-medicos',
        subcategoria_id: 14
    },
    {
        id: '10',
        name: 'Diapason Set | 128HZ',
        description: 'Cada diapasón incluye un martillo de madera con cabeza de goma, llave Allen, paño y estuche de terciopelo.',
        price: 25,
        image_url: '/cat_accesorios.png',
        categoria_slug: 'accesorios-medicos',
        subcategoria_id: 14
    },
    {
        id: '11',
        name: 'Martillo Neurologico Taylor',
        description: 'Ideal para exploración de reflejos. Colores: Negro, rojo, azul, rosado. Tamaño: 18,5cm',
        price: 6,
        image_url: '/cat_accesorios.png',
        categoria_slug: 'accesorios-medicos',
        subcategoria_id: 15
    },
    {
        id: '12',
        name: 'Martillo Neurologico Buck',
        description: 'Función 3 en 1: Pruebas de reflejos, sensibilidad al dolor y tacto fino. Incluye martillo, aguja y pincel.',
        price: 10,
        image_url: '/cat_accesorios.png',
        categoria_slug: 'accesorios-medicos',
        subcategoria_id: 16
    },
    {
        id: '13',
        name: 'Martillo Neurologico Set',
        description: 'Contenido del Kit: Martillo Babinski, Martillo cuadrado Queen, Rueda wartenberg, Martillo buck, Martillo tromner reflex.',
        price: 22,
        image_url: '/cat_accesorios.png',
        categoria_slug: 'accesorios-medicos',
        subcategoria_id: 16
    },
    {
        id: '14',
        name: 'Estuche Estetoscopio Littmann',
        description: 'Util para Littmann y otros modelos. Bolsillo interno de malla. Colores: Variados',
        price: 18,
        image_url: '/cat_accesorios.png',
        categoria_slug: 'accesorios-medicos',
        subcategoria_id: 17
    },
    {
        id: '15',
        name: 'Goniometro Plastico | 360°',
        description: 'Modelo de 360 grados de 6, 8 o 12 pulgadas.',
        price: 5,
        image_url: '/cat_accesorios.png',
        categoria_slug: 'accesorios-medicos',
        subcategoria_id: 18
    },
    {
        id: '16',
        name: 'Atomizador Alcohol Portatil',
        description: 'Capacidad: 50ml. Colores: Variados (Consultar disponibilidad)',
        price: 2,
        image_url: '/cat_accesorios.png',
        categoria_slug: 'accesorios-medicos',
        subcategoria_id: 19
    },
    {
        id: '17',
        name: 'Atomizador Perfume 5ml | Recargable',
        description: 'Ideal para llevar tu perfume preferido a todo lugar. Capacidad: 5ml. Colores variados.',
        price: 3,
        image_url: '/cat_accesorios.png',
        categoria_slug: 'accesorios-medicos',
        subcategoria_id: 20
    },
    {
        id: '18',
        name: 'Maxi Koala Medico',
        description: 'Materiales resistentes y lavables (nylon/poliéster). Múltiples compartimentos organizados y soportes elásticos.',
        price: 15,
        image_url: '/cat_accesorios.png',
        categoria_slug: 'accesorios-medicos',
        subcategoria_id: 21
    },
    {
        id: '19',
        name: 'Koala Clasico Medico',
        description: 'Koala médico talla L. Múltiples bolsillos y compartimentos con cremallera.',
        price: 10,
        image_url: '/cat_accesorios.png',
        categoria_slug: 'accesorios-medicos',
        subcategoria_id: 22
    },
    {
        id: '20',
        name: 'Koala Enfermeria Riñonera',
        description: 'Excelente para organizar e instrumentar rápido durante guardias y prácticas. Talla L.',
        price: 12,
        image_url: '/cat_accesorios.png',
        categoria_slug: 'accesorios-medicos',
        subcategoria_id: 23
    },
    {
        id: '21',
        name: 'Pad de Practica Silicon | Clinical',
        description: 'Pad de sutura de silicona para practicar tus técnicas preferidas. 3 capas de piel. Medidas: 12x17x1,3 cm',
        price: 12,
        image_url: '/cat_accesorios.png',
        categoria_slug: 'accesorios-medicos',
        subcategoria_id: 25
    },
    {
        id: '22',
        name: 'Kit de Sutura 5 Piezas',
        description: 'Contiene: 01 Piel sintética, Tijera de iris, Pinza de disección con diente, Mango de bisturí, Pinza hemostasia curva, Porta aguja, suturas y bisturíes.',
        price: 20,
        image_url: '/cat_accesorios.png',
        categoria_slug: 'accesorios-medicos',
        subcategoria_id: 24
    },
    {
        id: '23',
        name: 'Kit de Sutura Avanzado 11 Piezas',
        description: 'Kit profesional de acero inoxidable: Tijera iris, Pinzas de disección, Mangos, Pinza hemostática, Sonda acanalada, bisturí y suturas de nylon.',
        price: 35,
        image_url: '/cat_accesorios.png',
        categoria_slug: 'accesorios-medicos',
        subcategoria_id: 24
    },
    {
        id: '24',
        name: 'Torniquete Automatico',
        description: 'Sistema de bloqueo y liberación rápida. Medida: 40cm. Elástico y cómodo.',
        price: 4,
        image_url: '/cat_accesorios.png',
        categoria_slug: 'accesorios-medicos',
        subcategoria_id: 26
    },
    {
        id: '25',
        name: 'Torniquete Goma Plano',
        description: 'Torniquete de liga de alta elasticidad. Medidas: 45x2.5cm. Color: Azul',
        price: 2,
        image_url: '/cat_accesorios.png',
        categoria_slug: 'accesorios-medicos',
        subcategoria_id: 27
    },
    {
        id: '26',
        name: 'Rompeampolla Plastico Animado',
        description: 'Modelos animados divertidos impresos en 3D para romper ampollas sin riesgo.',
        price: 3,
        image_url: '/cat_accesorios.png',
        categoria_slug: 'accesorios-medicos',
        subcategoria_id: 29
    },
    {
        id: '27',
        name: 'Rompeampolla Silicon Premium',
        description: 'Modelos de silicona premium suave y flexible. Diseños surtidos.',
        price: 4,
        image_url: '/cat_accesorios.png',
        categoria_slug: 'accesorios-medicos',
        subcategoria_id: 30
    },
    {
        id: '28',
        name: 'Tijera Extricación / Trauma',
        description: 'Tijera de trauma de alta resistencia para cortar ropa y vendajes. Medidas: 15cm o 19cm.',
        price: 6,
        image_url: '/cat_accesorios.png',
        categoria_slug: 'accesorios-medicos',
        subcategoria_id: 32
    }
];

export async function fetchCategoryProducts(categorySlug: string, subcategoryId?: number): Promise<{
    category: CategoryInfo | null;
    products: Product[];
}> {
    const category = CATEGORIES[categorySlug] || null;
    if (!category) {
        return { category: null, products: [] };
    }

    // Query Supabase if configured
    if (isSupabaseConfigured() && supabase) {
        try {
            let query = supabase
                .from('products')
                .select('*')
                .eq('categoria_slug', categorySlug);

            if (subcategoryId) {
                query = query.eq('subcategoria_id', subcategoryId);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching from Supabase:', error.message);
            } else if (data && data.length > 0) {
                const products: Product[] = data.map((row: any) => ({
                    id: String(row.id),
                    name: String(row.name),
                    description: String(row.description || ''),
                    price: Number(row.price),
                    image_url: String(row.image_url || ''),
                    categoria_slug: String(row.categoria_slug),
                    subcategoria_id: row.subcategoria_id ? Number(row.subcategoria_id) : undefined,
                    type_color: row.type_color ? String(row.type_color) : undefined,
                    genero: row.genero ? String(row.genero) : undefined,
                    modelo: row.modelo ? String(row.modelo) : undefined,
                    cinta: row.cinta ? String(row.cinta) : undefined,
                }));

                return { category, products };
            }
        } catch (error) {
            console.error('Error fetching from Supabase, falling back to mock data:', error);
        }
    }

    // Fallback to static mock products
    let products = MOCK_PRODUCTS.filter(p => p.categoria_slug === categorySlug);
    if (subcategoryId) {
        products = products.filter(p => p.subcategoria_id === subcategoryId);
    }

    return { category, products };
}

export async function fetchAllProducts(): Promise<Product[]> {
    if (isSupabaseConfigured() && supabase) {
        try {
            const { data, error } = await supabase.from('products').select('*');
            if (!error && data && data.length > 0) {
                return data.map((row: any) => ({
                    id: String(row.id),
                    name: String(row.name),
                    description: String(row.description || ''),
                    price: Number(row.price),
                    image_url: String(row.image_url || ''),
                    categoria_slug: String(row.categoria_slug),
                    subcategoria_id: row.subcategoria_id ? Number(row.subcategoria_id) : undefined,
                    type_color: row.type_color ? String(row.type_color) : undefined,
                    genero: row.genero ? String(row.genero) : undefined,
                    modelo: row.modelo ? String(row.modelo) : undefined,
                    cinta: row.cinta ? String(row.cinta) : undefined,
                }));
            }
        } catch (error) {
            console.error('Error fetching all products from Supabase:', error);
        }
    }
    return MOCK_PRODUCTS;
}

export async function fetchProductById(id: string): Promise<Product | null> {
    if (isSupabaseConfigured() && supabase) {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (!error && data) {
                return {
                    id: String(data.id),
                    name: String(data.name),
                    description: String(data.description || ''),
                    price: Number(data.price),
                    image_url: String(data.image_url || ''),
                    categoria_slug: String(data.categoria_slug),
                    subcategoria_id: data.subcategoria_id ? Number(data.subcategoria_id) : undefined,
                    type_color: data.type_color ? String(data.type_color) : undefined,
                    genero: data.genero ? String(data.genero) : undefined,
                    modelo: data.modelo ? String(data.modelo) : undefined,
                    cinta: data.cinta ? String(data.cinta) : undefined,
                };
            }
        } catch (error) {
            console.error('Error fetching product by id from Supabase:', error);
        }
    }
    return MOCK_PRODUCTS.find(p => p.id === id) || null;
}
