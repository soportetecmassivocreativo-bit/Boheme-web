import fs from 'node:fs';
import path from 'node:path';

export interface PagoMovilAccount {
    id: string;
    banco: string; // e.g. "Banco de Venezuela (0102)"
    telefono: string; // e.g. "0412-1409976"
    telefonoRaw: string; // e.g. "04121409976"
    cedula: string; // e.g. "V-24.354.847"
    cedulaRaw: string; // e.g. "24354847"
    titular: string; // e.g. "BOHEME"
    activo: boolean;
}

export interface BinanceAccount {
    id: string;
    email: string; // e.g. "worldglobalweb724@gmail.com"
    payId?: string;
    titular?: string;
    activo: boolean;
}

export type ExtraPaymentType = 'pago_movil' | 'transferencia' | 'binance' | 'zelle' | 'zinli' | 'paypal' | 'efectivo' | 'otro';

export interface ExtraPaymentAccount {
    id: string;
    tipo: ExtraPaymentType;
    nombreMetodo: string; // e.g. "Transferencia Banesco", "Pago Móvil Mercantil", "Zelle Corporativo"
    bancoOPlataforma: string; // e.g. "Banesco (0134)", "Zelle", "Mercantil (0105)"
    titular: string;
    cedulaORif?: string;
    telefono?: string;
    numeroCuentaOCorreo: string; // Account number, email, or phone
    tipoCuenta?: string; // e.g. "Corriente", "Ahorro", "USDT", "USD"
    moneda: 'BS' | 'USD';
    instrucciones?: string;
    activo: boolean;
}

export interface InvoiceCorrelativeSettings {
    prefijo: string; // e.g. "BHM-"
    proximoNumero: number; // e.g. 1003
    digitosMinimos: number; // e.g. 4 -> 1003 or 0005
    sufijo?: string; // optional suffix e.g. "-2026"
}

export interface PdfTemplateSettings {
    nombreEmpresa: string;
    rifEmpresa: string;
    direccionFiscal: string;
    telefonoContacto: string;
    emailContacto?: string;
    colorPrimario: string; // e.g. "#5F2142"
    colorAcento: string; // e.g. "#D86A33"
    mostrarLogo: boolean;
    mostrarTasaBcv: boolean;
    mostrarFirmas: boolean;
    mostrarSelloAgua: boolean;
    encabezadoFactura: string;
    piePaginaFactura: string;
    encabezadoReporte: string;
    piePaginaReporte: string;
    tamanoPapel: 'letter' | 'a4';
    orientacionReporte: 'portrait' | 'landscape';
}

export interface StoreGeneralSettings {
    nombreTienda: string;
    telefonoWhatsapp: string; // e.g. "584121409976"
    mensajeWhatsappIntro?: string;
    instagram?: string;
    direccionFisica?: string;
    monedaPrincipal: string; // 'USD'
}

export type AdminUserRole = 'super_admin' | 'admin' | 'taller' | 'facturacion';

export interface AdminUser {
    id: string;
    nombre: string;
    email: string;
    password: string;
    rol: AdminUserRole;
    cargo?: string;
    telefono?: string;
    activo: boolean;
    createdAt: string;
}

export interface SiteSettings {
    pagoMovil: PagoMovilAccount;
    binance: BinanceAccount;
    cuentasAdicionales: ExtraPaymentAccount[];
    correlativo: InvoiceCorrelativeSettings;
    pdfConfig: PdfTemplateSettings;
    tienda: StoreGeneralSettings;
    usuarios: AdminUser[];
    lastUpdated: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
    pagoMovil: {
        id: 'pm-principal',
        banco: 'Banco de Venezuela (0102)',
        telefono: '0412-1409976',
        telefonoRaw: '04121409976',
        cedula: 'V-24.354.847',
        cedulaRaw: '24354847',
        titular: 'BOHEME',
        activo: true
    },
    binance: {
        id: 'binance-principal',
        email: 'worldglobalweb724@gmail.com',
        payId: '',
        titular: 'BOHEME',
        activo: true
    },
    cuentasAdicionales: [],
    correlativo: {
        prefijo: 'BHM-',
        proximoNumero: 1003,
        digitosMinimos: 4,
        sufijo: ''
    },
    pdfConfig: {
        nombreEmpresa: 'BOHEME • Indumentaria & Equipos Médicos',
        rifEmpresa: 'V-24.354.847',
        direccionFiscal: 'Municipio Miranda (Coro) y Municipio Colina (La Vela), Estado Falcón, Venezuela',
        telefonoContacto: '0412-1409976',
        emailContacto: 'worldglobalweb724@gmail.com',
        colorPrimario: '#5F2142',
        colorAcento: '#D86A33',
        mostrarLogo: true,
        mostrarTasaBcv: true,
        mostrarFirmas: true,
        mostrarSelloAgua: true,
        encabezadoFactura: 'FACTURA / COMPROBANTE DE COMPRA',
        piePaginaFactura: 'Gracias por tu compra en BOHEME. Entregas locales en Municipio Miranda y Municipio Colina, y envíos nacionales garantizados.',
        encabezadoReporte: 'REPORTE OFICIAL DE GESTIÓN ADMINISTRATIVA',
        piePaginaReporte: 'Documento generado por el Panel Administrativo de BOHEME • Uso Interno y Contable.',
        tamanoPapel: 'letter',
        orientacionReporte: 'portrait'
    },
    tienda: {
        nombreTienda: 'BOHEME',
        telefonoWhatsapp: '584121409976',
        mensajeWhatsappIntro: '¡Hola! He formalizado mi pedido en la web de BOHEME.',
        instagram: '@boheme_ve',
        direccionFisica: 'Municipio Miranda (Coro) y Municipio Colina (La Vela), Estado Falcón, Venezuela',
        monedaPrincipal: 'USD'
    },
    usuarios: [
        {
            id: 'user-admin-principal',
            nombre: 'Administrador Principal BOHEME',
            email: process.env.ADMIN_EMAIL || 'admin@boheme.com',
            password: process.env.ADMIN_PASSWORD || 'boheme2026',
            rol: 'super_admin',
            cargo: 'Gerencia & Administración General',
            telefono: '0412-1409976',
            activo: true,
            createdAt: '2026-01-01T00:00:00.000Z'
        }
    ],
    lastUpdated: new Date().toISOString()
};

const SETTINGS_FILE = path.join(process.cwd(), '.site_settings.json');
let memorySettings: SiteSettings = { ...DEFAULT_SETTINGS };

function loadSettingsFromDisk(): SiteSettings {
    try {
        if (fs.existsSync(SETTINGS_FILE)) {
            const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
            const parsed = JSON.parse(raw);
            if (parsed) {
                memorySettings = {
                    ...DEFAULT_SETTINGS,
                    ...parsed,
                    pagoMovil: { ...DEFAULT_SETTINGS.pagoMovil, ...(parsed.pagoMovil || {}) },
                    binance: { ...DEFAULT_SETTINGS.binance, ...(parsed.binance || {}) },
                    cuentasAdicionales: Array.isArray(parsed.cuentasAdicionales) ? parsed.cuentasAdicionales : DEFAULT_SETTINGS.cuentasAdicionales,
                    correlativo: { ...DEFAULT_SETTINGS.correlativo, ...(parsed.correlativo || {}) },
                    pdfConfig: { ...DEFAULT_SETTINGS.pdfConfig, ...(parsed.pdfConfig || {}) },
                    tienda: { ...DEFAULT_SETTINGS.tienda, ...(parsed.tienda || {}) },
                    usuarios: Array.isArray(parsed.usuarios) && parsed.usuarios.length > 0
                        ? parsed.usuarios
                        : DEFAULT_SETTINGS.usuarios
                };
            }
        }
    } catch {
        // Keep defaults
    }
    return memorySettings;
}

// Initial load
loadSettingsFromDisk();

function saveToDisk(settings: SiteSettings) {
    try {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
    } catch {
        // Disk write fallback
    }
}

export function formatInvoiceCorrelative(correlativo: InvoiceCorrelativeSettings, numOverride?: number): string {
    const num = numOverride !== undefined ? numOverride : (correlativo.proximoNumero || 1003);
    const digits = Math.max(1, Number(correlativo.digitosMinimos) || 4);
    const padded = String(num).padStart(digits, '0');
    const prefix = correlativo.prefijo ?? 'BHM-';
    const suffix = correlativo.sufijo ?? '';
    return `${prefix}${padded}${suffix}`;
}

export function consumeNextInvoiceNumber(): string {
    loadSettingsFromDisk();
    const currentCorrelativo = memorySettings.correlativo || DEFAULT_SETTINGS.correlativo;
    const formatted = formatInvoiceCorrelative(currentCorrelativo);
    memorySettings = {
        ...memorySettings,
        correlativo: {
            ...currentCorrelativo,
            proximoNumero: (Number(currentCorrelativo.proximoNumero) || 1003) + 1
        },
        lastUpdated: new Date().toISOString()
    };
    saveToDisk(memorySettings);
    return formatted;
}

export function getSiteSettingsSync(): SiteSettings {
    return loadSettingsFromDisk();
}

export async function getSiteSettings(): Promise<SiteSettings> {
    return loadSettingsFromDisk();
}

export async function updateSiteSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
    loadSettingsFromDisk();
    const updated: SiteSettings = {
        ...memorySettings,
        ...updates,
        pagoMovil: updates.pagoMovil 
            ? { 
                ...memorySettings.pagoMovil, 
                ...updates.pagoMovil,
                telefonoRaw: updates.pagoMovil.telefono ? updates.pagoMovil.telefono.replace(/\D/g, '') : memorySettings.pagoMovil.telefonoRaw,
                cedulaRaw: updates.pagoMovil.cedula ? updates.pagoMovil.cedula.replace(/\D/g, '') : memorySettings.pagoMovil.cedulaRaw
            } 
            : memorySettings.pagoMovil,
        binance: updates.binance 
            ? { ...memorySettings.binance, ...updates.binance } 
            : memorySettings.binance,
        cuentasAdicionales: Array.isArray(updates.cuentasAdicionales)
            ? updates.cuentasAdicionales
            : memorySettings.cuentasAdicionales,
        correlativo: updates.correlativo
            ? {
                ...memorySettings.correlativo,
                ...updates.correlativo,
                proximoNumero: Math.max(1, Number(updates.correlativo.proximoNumero ?? memorySettings.correlativo.proximoNumero) || 1),
                digitosMinimos: Math.min(10, Math.max(1, Number(updates.correlativo.digitosMinimos ?? memorySettings.correlativo.digitosMinimos) || 4))
            }
            : memorySettings.correlativo,
        pdfConfig: updates.pdfConfig
            ? { ...memorySettings.pdfConfig, ...updates.pdfConfig }
            : memorySettings.pdfConfig,
        tienda: updates.tienda 
            ? { ...memorySettings.tienda, ...updates.tienda } 
            : memorySettings.tienda,
        usuarios: Array.isArray(updates.usuarios)
            ? updates.usuarios
            : memorySettings.usuarios,
        lastUpdated: new Date().toISOString()
    };

    memorySettings = updated;
    saveToDisk(updated);
    return updated;
}
