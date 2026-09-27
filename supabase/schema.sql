-- =========================================================
-- BOHEME - SUPABASE DATABASE SCHEMA & INITIAL SEED DATA
-- =========================================================

-- 1. Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create subcategories table
CREATE TABLE IF NOT EXISTS public.subcategories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category_id TEXT REFERENCES public.categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    image_url TEXT,
    categoria_slug TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    subcategoria_id INTEGER REFERENCES public.subcategories(id) ON DELETE SET NULL,
    type_color TEXT,
    genero TEXT,
    modelo TEXT,
    cinta TEXT,
    stock INTEGER DEFAULT 10,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 5. Create Public Read Policies (Allow anyone to view categories and products)
DROP POLICY IF EXISTS "Public categories read" ON public.categories;
CREATE POLICY "Public categories read" 
ON public.categories FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Public subcategories read" ON public.subcategories;
CREATE POLICY "Public subcategories read" 
ON public.subcategories FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Public products read" ON public.products;
CREATE POLICY "Public products read" 
ON public.products FOR SELECT 
USING (true);

-- 6. Insert Categories
INSERT INTO public.categories (id, title, description) VALUES
('gorros', 'Gorros', 'Explora nuestra colección de gorros diseñados para brindarte confort y estilo en tu labor diaria.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.categories (id, title, description) VALUES
('lanyards', 'Lanyards', 'Explora nuestra colección de lanyards diseñados para brindarte confort y estilo en tu labor diaria.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.categories (id, title, description) VALUES
('accesorios-medicos', 'Accesorios médicos', 'Explora nuestra colección de accesorios médicos diseñados para brindarte confort y estilo en tu labor diaria.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.categories (id, title, description) VALUES
('equipos-medicos', 'Equipos médicos', 'Explora nuestra colección de equipos médicos diseñados para brindarte confort y estilo en tu labor diaria.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.categories (id, title, description) VALUES
('productos-personalizados', 'Productos personalizados', 'Explora nuestra colección de productos personalizados diseñados para brindarte confort y estilo en tu labor diaria.')
ON CONFLICT (id) DO NOTHING;

-- 7. Insert Subcategories
INSERT INTO public.subcategories (id, name, category_id) OVERRIDING SYSTEM VALUE VALUES
(70, 'Gorritos en stock', 'gorros'),
(71, 'Gorritos personalizados', 'gorros'),
(5, 'Lanyards Básicos', 'lanyards'),
(6, 'Lanyards personalizados', 'lanyards'),
(7, 'Portacarnet transparente', 'lanyards'),
(8, 'Cintas metricas', 'accesorios-medicos'),
(9, 'Adipometro', 'accesorios-medicos'),
(10, 'Calculadora portatil', 'accesorios-medicos'),
(11, 'Calculadora llavero', 'accesorios-medicos'),
(12, 'Tabla portadocumentos', 'accesorios-medicos'),
(13, 'Caliper', 'accesorios-medicos'),
(14, 'Diapason', 'accesorios-medicos'),
(15, 'Martillo neurologico taylor', 'accesorios-medicos'),
(16, 'Martillo neurologico Buck', 'accesorios-medicos'),
(17, 'Estuche estetoscopio', 'accesorios-medicos'),
(18, 'Goniometro', 'accesorios-medicos'),
(19, 'Atomizador alcohol portatil', 'accesorios-medicos'),
(20, 'Atomizador de perfume', 'accesorios-medicos'),
(21, 'Koala medico Maxi', 'accesorios-medicos'),
(22, 'Koala medico clásico', 'accesorios-medicos'),
(23, 'Koala enfermeria (riñonera)', 'accesorios-medicos'),
(24, 'Kit de sutura (cirugia menor)', 'accesorios-medicos'),
(25, 'Pad de practica sutura', 'accesorios-medicos'),
(26, 'Toniquete automatico', 'accesorios-medicos'),
(27, 'Torniquete liga', 'accesorios-medicos'),
(28, 'Rompeampolla básico', 'accesorios-medicos'),
(29, 'Rompeampolla animado', 'accesorios-medicos'),
(30, 'Rompeampolla silicon', 'accesorios-medicos'),
(31, 'Llaveros animados salud', 'accesorios-medicos'),
(32, 'Tijera de trauma', 'accesorios-medicos'),
(33, 'Tinta para sello', 'accesorios-medicos'),
(34, 'Pines para bata', 'accesorios-medicos'),
(35, 'Pines estetoscopio', 'accesorios-medicos'),
(36, 'Estuche oximetro', 'accesorios-medicos'),
(37, 'Mesa para laptop', 'accesorios-medicos'),
(38, 'Tensiometro manual básico color (negro)', 'equipos-medicos'),
(39, 'Tensiometro manual doble campana colores', 'equipos-medicos'),
(40, 'Tensiometro digital de brazalete', 'equipos-medicos'),
(41, 'Tensiometro digital de muñeca', 'equipos-medicos'),
(42, 'Otoscopio basico', 'equipos-medicos'),
(43, 'Otoscopio profesional', 'equipos-medicos'),
(44, 'Estetoscopio básico', 'equipos-medicos'),
(45, 'Estetoscopio doble campana', 'equipos-medicos'),
(46, 'Doppler fetal portatil', 'equipos-medicos'),
(47, 'Linterna frontal', 'equipos-medicos'),
(48, 'Linterna pupilar', 'equipos-medicos'),
(49, 'Glucometro', 'equipos-medicos'),
(50, 'Oximetro adulto básico', 'equipos-medicos'),
(51, 'Oximetro adulto recargable', 'equipos-medicos'),
(52, 'Oximetro pediatrico', 'equipos-medicos'),
(53, 'Nebulizador portatil', 'equipos-medicos'),
(54, 'Nebulizador de compresor', 'equipos-medicos'),
(55, 'Termometro digital animado', 'equipos-medicos'),
(56, 'Termometro digital basico', 'equipos-medicos'),
(57, 'Franelas con estampado DTF', 'productos-personalizados'),
(58, 'Llaveros acrílicos', 'productos-personalizados'),
(59, 'Peluches', 'productos-personalizados'),
(60, 'Cojines', 'productos-personalizados'),
(61, 'Cartucheras', 'productos-personalizados'),
(62, 'Delantales', 'productos-personalizados'),
(63, 'Pañoletas', 'productos-personalizados'),
(64, 'Totebag', 'productos-personalizados'),
(65, 'Fotos polaroid', 'productos-personalizados'),
(66, 'Minilibretas', 'productos-personalizados')
ON CONFLICT (id) DO NOTHING;

-- 8. Insert Initial Products
INSERT INTO public.products (id, name, description, price, image_url, categoria_slug, subcategoria_id) VALUES
('1', 'Cinta Métrica Retractil', 'Basica | Largo: 150cm Colores variados (Consultar)', 2.00, '/cat_accesorios.png', 'accesorios-medicos', 8),
('2', 'Adipometro', 'Plastico | Generico. Instrumento para la medición del porcentaje de grasa corporal. Rango de Medición: 0-70mm. Colores: Negro, Blanco y Rosado', 5.00, '/cat_accesorios.png', 'accesorios-medicos', 9),
('3', 'Calculadora Portatil Casio', 'Modelo Casio. Colores: Negro, Rosado, Blanco, Azul. Medidas: 11,8×6,9×1,8cm', 8.00, '/cat_accesorios.png', 'accesorios-medicos', 10),
('4', 'Calculadora Portatil Economica', 'Modelo sencillo y funcional. Color: Negro', 4.00, '/cat_accesorios.png', 'accesorios-medicos', 10),
('5', 'Mini Calculadora Llavero', 'Colores varían según disponibilidad (Consultar). Tamaño: 5,5x8,6x0,8cm', 3.00, '/cat_accesorios.png', 'accesorios-medicos', 11),
('6', 'Carpeta Portadocumento Básica', 'Apertura frontal. Colores: Variados (Consultar disponibilidad). Tamaño: A4 (23,7X36cm). Capacidad: 100 hojas', 5.00, '/cat_accesorios.png', 'accesorios-medicos', 12),
('7', 'Carpeta Portadocumento Con Almacenamiento', 'Apertura Lateral. Modelo con almacenamiento inferior. Colores: Variados. Tamaño: Carta', 8.00, '/cat_accesorios.png', 'accesorios-medicos', 12),
('8', 'Caliper EKG Profesional', 'Instrumento de precisión para medir intervalos y distancias entre ondas en un electrocardiograma. Colores: Negro, rosado, azul (Consultar Disponibilidad). Tamaño: 12cm de largo.', 10.00, '/cat_accesorios.png', 'accesorios-medicos', 13),
('9', 'Diapason Unidad | 128 HZ', 'Con Sordina. Colores: Plateado, Dorado, Azul, Rosado. Incluye martillo. Tamaño: 17,5cm', 12.00, '/cat_accesorios.png', 'accesorios-medicos', 14),
('10', 'Diapason Set | 128HZ', 'Cada diapasón incluye un martillo de madera con cabeza de goma, llave Allen, paño y estuche de terciopelo.', 25.00, '/cat_accesorios.png', 'accesorios-medicos', 14),
('11', 'Martillo Neurologico Taylor', 'Ideal para exploración de reflejos. Colores: Negro, rojo, azul, rosado. Tamaño: 18,5cm', 6.00, '/cat_accesorios.png', 'accesorios-medicos', 15),
('12', 'Martillo Neurologico Buck', 'Función 3 en 1: Pruebas de reflejos, sensibilidad al dolor y tacto fino. Incluye martillo, aguja y pincel.', 10.00, '/cat_accesorios.png', 'accesorios-medicos', 16),
('13', 'Martillo Neurologico Set', 'Contenido del Kit: Martillo Babinski, Martillo cuadrado Queen, Rueda wartenberg, Martillo buck, Martillo tromner reflex.', 22.00, '/cat_accesorios.png', 'accesorios-medicos', 16),
('14', 'Estuche Estetoscopio Littmann', 'Util para Littmann y otros modelos. Bolsillo interno de malla. Colores: Variados', 18.00, '/cat_accesorios.png', 'accesorios-medicos', 17),
('15', 'Goniometro Plastico | 360°', 'Modelo de 360 grados de 6, 8 o 12 pulgadas.', 5.00, '/cat_accesorios.png', 'accesorios-medicos', 18),
('16', 'Atomizador Alcohol Portatil', 'Capacidad: 50ml. Colores: Variados (Consultar disponibilidad)', 2.00, '/cat_accesorios.png', 'accesorios-medicos', 19),
('17', 'Atomizador Perfume 5ml | Recargable', 'Ideal para llevar tu perfume preferido a todo lugar. Capacidad: 5ml. Colores variados.', 3.00, '/cat_accesorios.png', 'accesorios-medicos', 20),
('18', 'Maxi Koala Medico', 'Materiales resistentes y lavables (nylon/poliéster). Múltiples compartimentos organizados y soportes elásticos.', 15.00, '/cat_accesorios.png', 'accesorios-medicos', 21),
('19', 'Koala Clasico Medico', 'Koala médico talla L. Múltiples bolsillos y compartimentos con cremallera.', 10.00, '/cat_accesorios.png', 'accesorios-medicos', 22),
('20', 'Koala Enfermeria Riñonera', 'Excelente para organizar e instrumentar rápido durante guardias y prácticas. Talla L.', 12.00, '/cat_accesorios.png', 'accesorios-medicos', 23),
('21', 'Pad de Practica Silicon | Clinical', 'Pad de sutura de silicona para practicar tus técnicas preferidas. 3 capas de piel. Medidas: 12x17x1,3 cm', 12.00, '/cat_accesorios.png', 'accesorios-medicos', 25),
('22', 'Kit de Sutura 5 Piezas', 'Contiene: 01 Piel sintética, Tijera de iris, Pinza de disección con diente, Mango de bisturí, Pinza hemostasia curva, Porta aguja, suturas y bisturíes.', 20.00, '/cat_accesorios.png', 'accesorios-medicos', 24),
('23', 'Kit de Sutura Avanzado 11 Piezas', 'Kit profesional de acero inoxidable: Tijera iris, Pinzas de disección, Mangos, Pinza hemostática, Sonda acanalada, bisturí y suturas de nylon.', 35.00, '/cat_accesorios.png', 'accesorios-medicos', 24),
('24', 'Torniquete Automatico', 'Sistema de bloqueo y liberación rápida. Medida: 40cm. Elástico y cómodo.', 4.00, '/cat_accesorios.png', 'accesorios-medicos', 26),
('25', 'Torniquete Goma Plano', 'Torniquete de liga de alta elasticidad. Medidas: 45x2.5cm. Color: Azul', 2.00, '/cat_accesorios.png', 'accesorios-medicos', 27),
('26', 'Rompeampolla Plastico Animado', 'Modelos animados divertidos impresos en 3D para romper ampollas sin riesgo.', 3.00, '/cat_accesorios.png', 'accesorios-medicos', 29),
('27', 'Rompeampolla Silicon Premium', 'Modelos de silicona premium suave y flexible. Diseños surtidos.', 4.00, '/cat_accesorios.png', 'accesorios-medicos', 30),
('28', 'Tijera Extricación / Trauma', 'Tijera de trauma de alta resistencia para cortar ropa y vendajes. Medidas: 15cm o 19cm.', 6.00, '/cat_accesorios.png', 'accesorios-medicos', 32)
ON CONFLICT (id) DO NOTHING;
