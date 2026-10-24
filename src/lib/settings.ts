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

export interface StoreGeneralSettings {
    nombreTienda: string;
    telefonoWhatsapp: string; // e.g. "584121409976"
    mensajeWhatsappIntro?: string;
    instagram?: string;
    direccionFisica?: string;
    monedaPrincipal: string; // 'USD'
}

export interface SiteSettings {
    pagoMovil: PagoMovilAccount;
    binance: BinanceAccount;
    tienda: StoreGeneralSettings;
    lastUpdated: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
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
    tienda: {
        nombreTienda: 'BOHEME',
        telefonoWhatsapp: '584121409976',
        mensajeWhatsappIntro: '¡Hola! He formalizado mi pedido en la web de BOHEME.',
        instagram: '@boheme_ve',
        direccionFisica: 'Valencia, Estado Carabobo, Venezuela',
        monedaPrincipal: 'USD'
    },
    lastUpdated: new Date().toISOString()
};

const SETTINGS_FILE = path.join(process.cwd(), '.site_settings.json');
let memorySettings: SiteSettings = { ...DEFAULT_SETTINGS };

// Load settings from disk on initialization
try {
    if (fs.existsSync(SETTINGS_FILE)) {
        const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && parsed.pagoMovil && parsed.binance) {
            memorySettings = {
                ...DEFAULT_SETTINGS,
                ...parsed,
                pagoMovil: { ...DEFAULT_SETTINGS.pagoMovil, ...parsed.pagoMovil },
                binance: { ...DEFAULT_SETTINGS.binance, ...parsed.binance },
                tienda: { ...DEFAULT_SETTINGS.tienda, ...parsed.tienda }
            };
        }
    }
} catch {
    // Keep defaults
}

function saveToDisk(settings: SiteSettings) {
    try {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
    } catch {
        // Disk write fallback
    }
}

export function getSiteSettingsSync(): SiteSettings {
    return memorySettings;
}

export async function getSiteSettings(): Promise<SiteSettings> {
    return memorySettings;
}

export async function updateSiteSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
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
        tienda: updates.tienda 
            ? { ...memorySettings.tienda, ...updates.tienda } 
            : memorySettings.tienda,
        lastUpdated: new Date().toISOString()
    };

    memorySettings = updated;
    saveToDisk(updated);
    return updated;
}
