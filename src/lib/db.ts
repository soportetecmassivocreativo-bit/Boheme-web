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
let MOCK_PRODUCTS: Product[] = [
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
    },

    // ==========================================
    // GORROS (Subcategories: 70 - En Stock, 71 - Personalizados)
    // ==========================================
    {
        id: '101',
        name: 'Gorro Quirúrgico Flores Boheme',
        description: '100% Algodón transpirable. Diseño floral exclusivo, banda absorbente en la frente y ajuste con elástico y tiras posteriores.',
        price: 8,
        image_url: '/cat_gorros.png',
        categoria_slug: 'gorros',
        subcategoria_id: 70
    },
    {
        id: '102',
        name: 'Gorro Quirófano Antifluido Azul Profundo',
        description: 'Tejido antifluido repelente de líquidos. Máxima frescura, suavidad y durabilidad para largas jornadas de turno.',
        price: 9,
        image_url: '/cat_gorros.png',
        categoria_slug: 'gorros',
        subcategoria_id: 70
    },
    {
        id: '103',
        name: 'Gorro Quirúrgico Butterfly Pastel',
        description: 'Confeccionado en tela suave y liviana con estampado de mariposas en tonos pastel. Ajuste anatómico perfecto.',
        price: 8.5,
        image_url: '/cat_gorros.png',
        categoria_slug: 'gorros',
        subcategoria_id: 70
    },
    {
        id: '104',
        name: 'Gorro Satinado Anti-Frizz Rosa Boheme',
        description: 'Interior forrado en satén de seda para proteger tu cabello del frizz y la estática durante todo tu turno.',
        price: 10,
        image_url: '/cat_gorros.png',
        categoria_slug: 'gorros',
        subcategoria_id: 70
    },
    {
        id: '105',
        name: 'Gorro Confort con Botones para Mascarilla',
        description: 'Incorpora botones laterales para enganchar la mascarilla y evitar dolor o presión en las orejas. Color Lila Boheme.',
        price: 9,
        image_url: '/cat_gorros.png',
        categoria_slug: 'gorros',
        subcategoria_id: 70
    },
    {
        id: '106',
        name: 'Gorro Bandana Unisex Lavanda',
        description: 'Modelo bandana envolvente de fácil ajuste. Excelente para doctores, enfermeros y odontólogos.',
        price: 8,
        image_url: '/cat_gorros.png',
        categoria_slug: 'gorros',
        subcategoria_id: 70
    },
    {
        id: '107',
        name: 'Gorro Personalizado con Nombre & Especialidad',
        description: 'Personalizado a tu gusto con tu nombre, especialidad médica o logo bordado de alta definición.',
        price: 12,
        image_url: '/cat_gorros.png',
        categoria_slug: 'gorros',
        subcategoria_id: 71
    },
    {
        id: '108',
        name: 'Gorro Personalizado Full Sublimación',
        description: 'Diseño temático exclusivo personalizado con los motivos, personajes o identidad que prefieras.',
        price: 14,
        image_url: '/cat_gorros.png',
        categoria_slug: 'gorros',
        subcategoria_id: 71
    },

    // ==========================================
    // LANYARDS (Subcategories: 5 - Básicos, 6 - Personalizados, 7 - Portacarnet)
    // ==========================================
    {
        id: '201',
        name: 'Lanyard Clásico Boheme con Gancho',
        description: 'Cinta satinada de 2cm con broche de seguridad antipánico y mosquetón metálico reforzado para llaves y carnet.',
        price: 3,
        image_url: '/cat_accesorios.png',
        categoria_slug: 'lanyards',
        subcategoria_id: 5
    },
    {
        id: '202',
        name: 'Lanyard Sublimado Colores Pastel',
        description: 'Estampado textil doble faz en tonos pasteles. Suave al tacto con el cuello, hipoalergénico y lavable.',
        price: 4,
        image_url: '/cat_accesorios.png',
        categoria_slug: 'lanyards',
        subcategoria_id: 5
    },
    {
        id: '203',
        name: 'Lanyard Portallaves y Tijera Reforzado',
        description: 'Diseño especial con doble sujeción para cargar credencial, llaves de locker y tijeras de trauma de forma segura.',
        price: 4.5,
        image_url: '/cat_accesorios.png',
        categoria_slug: 'lanyards',
        subcategoria_id: 5
    },
    {
        id: '204',
        name: 'Lanyard Personalizado Nombre & Servicio',
        description: 'Personalizado con tu nombre, servicio hospitalario, universidad o institución médica. Consulta colores disponibles.',
        price: 5,
        image_url: '/cat_accesorios.png',
        categoria_slug: 'lanyards',
        subcategoria_id: 6
    },
    {
        id: '205',
        name: 'Portacarnet Rígido Acrílico Transparente',
        description: 'Protector de credencial en acrílico transparente de alta resistencia. Protege de derrames y dobleces.',
        price: 2,
        image_url: '/cat_accesorios.png',
        categoria_slug: 'lanyards',
        subcategoria_id: 7
    },
    {
        id: '206',
        name: 'Portacarnet Retráctil Yoyo con Pin Médico',
        description: 'Yoyo retráctil de 60cm con clip metálico para el bolsillo y motivo temático en relieve (Estetoscopio / Jeringa).',
        price: 3.5,
        image_url: '/cat_accesorios.png',
        categoria_slug: 'lanyards',
        subcategoria_id: 7
    },

    // ==========================================
    // EQUIPOS MÉDICOS (Subcategories: 38 - Tensiometro manual, 40 - Tensiometro digital, 44/45 - Estetoscopio, 46 - Doppler, 48 - Linterna, 50 - Oximetro, 55 - Termometro)
    // ==========================================
    {
        id: '301',
        name: 'Estetoscopio Doble Campana Profesional',
        description: 'Excelente acústica para auscultación cardíaca y pulmonar. Olivas blandas ergonómicas y campana de acero inoxidable.',
        price: 25,
        image_url: '/cat_equipos.png',
        categoria_slug: 'equipos-medicos',
        subcategoria_id: 45
    },
    {
        id: '302',
        name: 'Estetoscopio Clínico Liviano',
        description: 'Modelo ligero ideal para estudiantes, enfermería y uso diario de rutina. Alta sensibilidad acústica.',
        price: 16,
        image_url: '/cat_equipos.png',
        categoria_slug: 'equipos-medicos',
        subcategoria_id: 44
    },
    {
        id: '303',
        name: 'Tensiómetro Manual con Brazalete Adulto',
        description: 'Kit de tensiómetro aneroide con manómetro de precisión, perilla con válvula de liberación y estuche protector.',
        price: 22,
        image_url: '/cat_equipos.png',
        categoria_slug: 'equipos-medicos',
        subcategoria_id: 38
    },
    {
        id: '304',
        name: 'Tensiómetro Digital Automático de Brazo',
        description: 'Medición precisa de presión arterial y frecuencia cardíaca con pantalla LCD grande retroiluminada y memoria de lecturas.',
        price: 30,
        image_url: '/cat_equipos.png',
        categoria_slug: 'equipos-medicos',
        subcategoria_id: 40
    },
    {
        id: '305',
        name: 'Linterna Pupilar Médica LED con Escala',
        description: 'Linterna de diagnóstico tipo bolígrafo con luz blanca LED, clip metálico y escala de dilatación pupilar impresa.',
        price: 5,
        image_url: '/cat_equipos.png',
        categoria_slug: 'equipos-medicos',
        subcategoria_id: 48
    },
    {
        id: '306',
        name: 'Oxímetro de Pulso Digital OLED Portátil',
        description: 'Mide SpO2 (oxígeno en sangre) y pulso en tiempo real. Pantalla OLED multidireccional con curva pletismográfica.',
        price: 15,
        image_url: '/cat_equipos.png',
        categoria_slug: 'equipos-medicos',
        subcategoria_id: 50
    },
    {
        id: '307',
        name: 'Termómetro Digital Rápido con Punta Flexible',
        description: 'Lectura precisa en 10 segundos con alarma de fiebre y memoria de última medición. Punta flexible lavable.',
        price: 6,
        image_url: '/cat_equipos.png',
        categoria_slug: 'equipos-medicos',
        subcategoria_id: 55
    },
    {
        id: '308',
        name: 'Doppler Fetal Portátil con Pantalla LCD',
        description: 'Detector de latidos fetales portátil de alta sensibilidad sonora con altavoz integrado y display digital.',
        price: 38,
        image_url: '/cat_equipos.png',
        categoria_slug: 'equipos-medicos',
        subcategoria_id: 46
    },

    // ==========================================
    // PRODUCTOS PERSONALIZADOS (Subcategories: 57 - Franelas, 58 - Llaveros, 60 - Cojines, 61 - Cartucheras, 64 - Totebag, 66 - Minilibretas)
    // ==========================================
    {
        id: '401',
        name: 'Franela Médica Algodón DTF Premium',
        description: '100% Algodón peinado suave con estampado DTF de alta definición. Personalizable con nombre, carrera o frases médicas.',
        price: 15,
        image_url: '/cat_accesorios.png',
        categoria_slug: 'productos-personalizados',
        subcategoria_id: 57
    },
    {
        id: '402',
        name: 'Totebag Canvas Boheme Personalizada',
        description: 'Bolsa ecológica de tela canvas reforzada, espaciosa para libros, uniforme, estetoscopio y pertenencias de guardia.',
        price: 10,
        image_url: '/cat_accesorios.png',
        categoria_slug: 'productos-personalizados',
        subcategoria_id: 64
    },
    {
        id: '403',
        name: 'Cartuchera Médica Organizadora Multibolsillos',
        description: 'Estuche compacto con compartimentos elásticos para bolígrafos, linterna pupilar, tijera de trauma y termómetro.',
        price: 8,
        image_url: '/cat_accesorios.png',
        categoria_slug: 'productos-personalizados',
        subcategoria_id: 61
    },
    {
        id: '404',
        name: 'Llavero Acrílico con Inicial & Profesión',
        description: 'Llavero personalizado cortado en acrílico cristal con acabado brillante e ilustración médica a elección.',
        price: 3.5,
        image_url: '/cat_accesorios.png',
        categoria_slug: 'productos-personalizados',
        subcategoria_id: 58
    },
    {
        id: '405',
        name: 'Minilibreta Médica con Tablas Clínicas',
        description: 'Cuaderno de bolsillo con espiral, tapas duras personalizadas e información de referencia rápida para guardias.',
        price: 4,
        image_url: '/cat_accesorios.png',
        categoria_slug: 'productos-personalizados',
        subcategoria_id: 66
    },
    {
        id: '406',
        name: 'Cojín Decorativo Temático Salud',
        description: 'Cojín mullido estampado con motivos alusivos a medicina y enfermería. Ideal para descanso o consultorio.',
        price: 12,
        image_url: '/cat_accesorios.png',
        categoria_slug: 'productos-personalizados',
        subcategoria_id: 60
    }
];

// Circuit breaker & timeout helper to prevent hanging when remote database is slow or unreachable
let supabaseCircuitTripped = false;
let lastTripTime = 0;
const CIRCUIT_RESET_MS = 60000; // Wait 60s before retrying database if it fails

async function executeWithTimeout<T>(promise: Promise<T>, timeoutMs = 1200): Promise<T> {
    let timeoutId: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Database query timed out')), timeoutMs);
    });
    try {
        return await Promise.race([promise, timeoutPromise]);
    } finally {
        clearTimeout(timeoutId!);
    }
}

function isCircuitOpen(): boolean {
    if (!supabaseCircuitTripped) return false;
    if (Date.now() - lastTripTime > CIRCUIT_RESET_MS) {
        supabaseCircuitTripped = false;
        return false;
    }
    return true;
}

function tripCircuit(err?: any) {
    supabaseCircuitTripped = true;
    lastTripTime = Date.now();
    console.warn('Supabase circuit breaker activated. Serving local catalog cache.', err?.message || err);
}

export async function fetchCategoryProducts(categorySlug: string, subcategoryId?: number): Promise<{
    category: CategoryInfo | null;
    products: Product[];
}> {
    const category = CATEGORIES[categorySlug] || null;
    if (!category) {
        return { category: null, products: [] };
    }

    // Query Supabase if configured and circuit breaker is closed
    if (isSupabaseConfigured() && supabase && !isCircuitOpen()) {
        try {
            let query = supabase
                .from('products')
                .select('*')
                .eq('categoria_slug', categorySlug);

            if (subcategoryId) {
                query = query.eq('subcategoria_id', subcategoryId);
            }

            const { data, error } = await executeWithTimeout(query as unknown as Promise<any>, 1200);

            if (error) {
                tripCircuit(error);
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
            tripCircuit(error);
        }
    }

    // Fast and resilient fallback to local catalog products
    let products = MOCK_PRODUCTS.filter(p => p.categoria_slug === categorySlug);
    if (subcategoryId) {
        products = products.filter(p => p.subcategoria_id === subcategoryId);
    }

    return { category, products };
}

export async function fetchAllProducts(): Promise<Product[]> {
    if (isSupabaseConfigured() && supabase && !isCircuitOpen()) {
        try {
            const { data, error } = await executeWithTimeout(
                supabase.from('products').select('*') as unknown as Promise<any>,
                1200
            );
            if (error) {
                tripCircuit(error);
            } else if (data && data.length > 0) {
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
            tripCircuit(error);
        }
    }
    return MOCK_PRODUCTS;
}

export async function fetchProductById(id: string): Promise<Product | null> {
    if (isSupabaseConfigured() && supabase && !isCircuitOpen()) {
        try {
            const { data, error } = await executeWithTimeout(
                supabase.from('products').select('*').eq('id', id).single() as unknown as Promise<any>,
                1200
            );

            if (error) {
                tripCircuit(error);
            } else if (data) {
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
            tripCircuit(error);
        }
    }
    return MOCK_PRODUCTS.find(p => p.id === id) || null;
}

export async function createProduct(productData: Omit<Product, 'id'> & { id?: string }): Promise<Product> {
    const newProduct: Product = {
        id: productData.id || String(Date.now()),
        name: productData.name,
        description: productData.description || '',
        price: Number(productData.price) || 0,
        image_url: productData.image_url || '/cat_gorros.png',
        categoria_slug: productData.categoria_slug,
        subcategoria_id: productData.subcategoria_id ? Number(productData.subcategoria_id) : undefined,
        type_color: productData.type_color,
        genero: productData.genero,
        modelo: productData.modelo,
        cinta: productData.cinta
    };

    if (isSupabaseConfigured() && supabase && !isCircuitOpen()) {
        try {
            const { data, error } = await executeWithTimeout(
                supabase.from('products').insert([newProduct]).select().single() as unknown as Promise<any>,
                2000
            );
            if (error) {
                tripCircuit(error);
            } else if (data) {
                newProduct.id = String(data.id);
            }
        } catch (error) {
            tripCircuit(error);
        }
    }

    // Always keep local in-memory catalog updated
    MOCK_PRODUCTS.unshift(newProduct);
    return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const existingIndex = MOCK_PRODUCTS.findIndex(p => p.id === id);

    if (isSupabaseConfigured() && supabase && !isCircuitOpen()) {
        try {
            const { error } = await executeWithTimeout(
                supabase.from('products').update(updates).eq('id', id) as unknown as Promise<any>,
                2000
            );
            if (error) {
                tripCircuit(error);
            }
        } catch (error) {
            tripCircuit(error);
        }
    }

    if (existingIndex !== -1) {
        MOCK_PRODUCTS[existingIndex] = {
            ...MOCK_PRODUCTS[existingIndex],
            ...updates
        };
        return MOCK_PRODUCTS[existingIndex];
    }

    return null;
}

export async function deleteProduct(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase && !isCircuitOpen()) {
        try {
            const { error } = await executeWithTimeout(
                supabase.from('products').delete().eq('id', id) as unknown as Promise<any>,
                2000
            );
            if (error) {
                tripCircuit(error);
            }
        } catch (error) {
            tripCircuit(error);
        }
    }

    const initialLength = MOCK_PRODUCTS.length;
    MOCK_PRODUCTS = MOCK_PRODUCTS.filter(p => p.id !== id);
    return MOCK_PRODUCTS.length < initialLength;
}

// ==========================================
// BILLING / ORDERS MODULE (Facturado & Pagos)
// ==========================================

export interface OrderItem {
    id?: string;
    name: string;
    price: number;
    quantity: number;
    image_url?: string;
    categoria_slug?: string;
    is_personalizado?: boolean;
    nombre_personalizado?: string;
    especialidad_personalizada?: string;
    color_preferencia?: string;
    detalles_personalizados?: string;
}

export interface Order {
    id: string;
    numero_factura: string; // e.g. BHM-1001
    created_at: string; // ISO date string
    cliente_nombre: string;
    cliente_apellido: string;
    cliente_cedula: string;
    cliente_telefono: string;
    tipo_entrega: 'local' | 'nacional';
    direccion_entrega: string;
    empresa_envio?: string;
    estado?: string;
    ciudad?: string;
    persona_retira?: string;
    cedula_retira?: string;
    // Payment details
    metodo_pago: 'pago_movil' | 'binance';
    banco_emisor?: string;
    telefono_o_email_emisor: string;
    referencia_pago: string;
    monto_usd: number;
    tasa_bcv: number;
    monto_bs: number;
    // Verification Status
    estado_pago: 'pendiente' | 'verificado' | 'rechazado';
    notas_admin?: string;
    // Items
    items: OrderItem[];
    es_manual?: boolean;
}

let INVOICE_COUNTER = 1003;

let ORDERS: Order[] = [
    {
        id: 'ord-1001',
        numero_factura: 'BHM-1001',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
        cliente_nombre: 'Dra. María',
        cliente_apellido: 'Fernández',
        cliente_cedula: 'V-21.458.962',
        cliente_telefono: '0414-3458921',
        tipo_entrega: 'nacional',
        empresa_envio: 'MRW',
        estado: 'Carabobo',
        ciudad: 'Valencia',
        direccion_entrega: 'Agencia MRW San Diego #0204',
        metodo_pago: 'pago_movil',
        banco_emisor: 'Banesco',
        telefono_o_email_emisor: '0414-3458921',
        referencia_pago: '849201',
        monto_usd: 24.00,
        tasa_bcv: 886.23,
        monto_bs: 21269.52,
        estado_pago: 'verificado',
        items: [
            {
                name: 'Gorro Quirúrgico Flores Boheme',
                price: 8.00,
                quantity: 1,
                categoria_slug: 'gorros'
            },
            {
                name: 'Gorro Personalizado con Nombre & Especialidad',
                price: 12.00,
                quantity: 1,
                categoria_slug: 'gorros',
                is_personalizado: true,
                nombre_personalizado: 'Dra. María Fernández',
                especialidad_personalizada: 'Pediatría',
                color_preferencia: 'Lila Boheme con bordado blanco'
            },
            {
                name: 'Lanyard Clásico Boheme con Gancho',
                price: 4.00,
                quantity: 1,
                categoria_slug: 'lanyards'
            }
        ]
    },
    {
        id: 'ord-1002',
        numero_factura: 'BHM-1002',
        created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 90 mins ago
        cliente_nombre: 'Dr. Alejandro',
        cliente_apellido: 'Torres',
        cliente_cedula: 'V-18.963.214',
        cliente_telefono: '0412-9874561',
        tipo_entrega: 'local',
        direccion_entrega: 'Centro Médico Quirúrgico, Piso 3, Consultorio 312',
        metodo_pago: 'binance',
        telefono_o_email_emisor: 'ale.torres.md@gmail.com',
        referencia_pago: 'TXID-872910398',
        monto_usd: 40.00,
        tasa_bcv: 886.23,
        monto_bs: 35449.20,
        estado_pago: 'pendiente',
        items: [
            {
                name: 'Estetoscopio Doble Campana Profesional',
                price: 25.00,
                quantity: 1,
                categoria_slug: 'equipos-medicos'
            },
            {
                name: 'Oxímetro de Pulso Digital OLED Portátil',
                price: 15.00,
                quantity: 1,
                categoria_slug: 'equipos-medicos'
            }
        ]
    }
];

export async function fetchOrders(): Promise<Order[]> {
    return [...ORDERS];
}

export async function createOrder(orderData: Omit<Order, 'id' | 'numero_factura' | 'created_at'> & { id?: string; numero_factura?: string; created_at?: string }): Promise<Order> {
    INVOICE_COUNTER += 1;
    const newOrder: Order = {
        ...orderData,
        id: orderData.id || `ord-${Date.now()}`,
        numero_factura: orderData.numero_factura || `BHM-${INVOICE_COUNTER}`,
        created_at: orderData.created_at || new Date().toISOString(),
        estado_pago: orderData.estado_pago || 'pendiente'
    };

    ORDERS.unshift(newOrder);
    return newOrder;
}

export async function updateOrderStatus(id: string, estado_pago: 'pendiente' | 'verificado' | 'rechazado', notas_admin?: string): Promise<Order | null> {
    const orderIndex = ORDERS.findIndex(o => o.id === id);
    if (orderIndex === -1) return null;

    ORDERS[orderIndex] = {
        ...ORDERS[orderIndex],
        estado_pago,
        notas_admin: notas_admin !== undefined ? notas_admin : ORDERS[orderIndex].notas_admin
    };

    return ORDERS[orderIndex];
}

export async function deleteOrder(id: string): Promise<boolean> {
    const initialLen = ORDERS.length;
    ORDERS = ORDERS.filter(o => o.id !== id);
    return ORDERS.length < initialLen;
}


