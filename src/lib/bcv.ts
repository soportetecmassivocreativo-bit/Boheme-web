import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';

export interface BcvRateData {
    rate: number;
    exactRate: number;
    rawRate: string;
    fechaValor: string;
    source: string;
    lastUpdated: string;
    formattedRate: string;
    isManual?: boolean;
}

// Default fallback data (updated to current official BCV baseline)
let memoryCache: BcvRateData = {
    rate: 887.30,
    exactRate: 887.302,
    rawRate: "887,30200000",
    fechaValor: "Martes, 27 Octubre 2026",
    source: "Banco Central de Venezuela (bcv.org.ve)",
    lastUpdated: new Date().toISOString(),
    formattedRate: "Bs. 887,30"
};

let lastFetchTimestamp: number = 0;
// Recheck every 5 minutes automatically so changes on bcv.org.ve are captured quickly
const CACHE_TTL_MS = 5 * 60 * 1000;

// Disk cache path for persistence across server restarts
const CACHE_FILE_PATH = path.join(process.cwd(), '.bcv_cache.json');

// Initialize cache from disk if available
try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
        const fileContent = fs.readFileSync(CACHE_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (parsed && typeof parsed.rate === 'number' && parsed.rate > 0) {
            memoryCache = {
                ...memoryCache,
                ...parsed,
                formattedRate: formatBs(parsed.rate)
            };
            if (parsed.lastUpdated) {
                lastFetchTimestamp = new Date(parsed.lastUpdated).getTime();
            }
        }
    }
} catch {
    // Ignore error reading cache file
}

function saveCacheToDisk(data: BcvRateData) {
    try {
        fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch {
        // Disk write error ignored
    }
}

/**
 * Direct scraper targeting the official Banco Central de Venezuela webpage
 * (https://www.bcv.org.ve)
 */
function scrapeBcvOfficial(): Promise<{ rate: number; exactRate: number; rawRate: string; fechaValor: string }> {
    return new Promise((resolve, reject) => {
        // BCV uses an internal Venezuelan state SSL certificate that often lacks public root trust in Node.js
        const agent = new https.Agent({ rejectUnauthorized: false });

        const req = https.get('https://www.bcv.org.ve', {
            agent,
            timeout: 12000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'es-VE,es;q=0.9,en;q=0.8',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        }, (res) => {
            if (res.statusCode !== 200) {
                return reject(new Error(`BCV HTTP ${res.statusCode}`));
            }

            let html = '';
            res.on('data', chunk => { html += chunk; });
            res.on('end', () => {
                try {
                    const dolarIdx = html.indexOf('id="dolar"');
                    if (dolarIdx === -1) {
                        return reject(new Error('Container id="dolar" not found in BCV page'));
                    }

                    const snippet = html.substring(dolarIdx, dolarIdx + 1200);
                    const rateMatch = snippet.match(/<strong[^>]*>\s*([0-9]+[.,][0-9]+)\s*<\/strong>/i);
                    if (!rateMatch) {
                        return reject(new Error('Rate tag not found in BCV snippet'));
                    }

                    const rawRate = rateMatch[1].trim();
                    const cleanRateStr = rawRate.replace(',', '.');
                    const numRate = parseFloat(cleanRateStr);
                    if (isNaN(numRate) || numRate <= 0) {
                        return reject(new Error(`Invalid rate parsed: ${cleanRateStr}`));
                    }

                    // Extract Fecha Valor (e.g., "Martes, 27 Octubre 2026")
                    let fechaValor = '';
                    const dateMatch = snippet.match(/Fecha\s+Valor:?\s*<span[^>]*>([^<]+)<\/span>/i) 
                        || html.match(/Fecha\s+Valor:?\s*<span[^>]*>([^<]+)<\/span>/i);
                    if (dateMatch) {
                        fechaValor = dateMatch[1].replace(/\s+/g, ' ').trim();
                    }

                    resolve({
                        rate: Math.round(numRate * 100) / 100,
                        exactRate: numRate,
                        rawRate,
                        fechaValor
                    });
                } catch (err: any) {
                    reject(err);
                }
            });
        });

        req.on('error', (err) => reject(err));
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Timeout connecting to bcv.org.ve'));
        });
    });
}

/**
 * Gets live BCV data. If forceRefresh is false and TTL has not expired, returns cached data.
 * Otherwise, queries https://www.bcv.org.ve to get the latest updated rate.
 */
export async function getLiveBcvData(forceRefresh = false): Promise<BcvRateData> {
    const now = Date.now();
    const isCacheExpired = (now - lastFetchTimestamp) >= CACHE_TTL_MS;

    if (!forceRefresh && !isCacheExpired && memoryCache.rate > 0) {
        return memoryCache;
    }

    try {
        const scraped = await scrapeBcvOfficial();
        const updatedData: BcvRateData = {
            rate: scraped.rate,
            exactRate: scraped.exactRate,
            rawRate: scraped.rawRate,
            fechaValor: scraped.fechaValor || memoryCache.fechaValor,
            source: "Banco Central de Venezuela (bcv.org.ve)",
            lastUpdated: new Date().toISOString(),
            formattedRate: formatBs(scraped.rate),
            isManual: false
        };

        memoryCache = updatedData;
        lastFetchTimestamp = now;
        saveCacheToDisk(updatedData);

        return updatedData;
    } catch (error) {
        console.warn('Could not scrape BCV live, using cached rate:', error);
        // Return existing cached data if live scrape failed (e.g. temporary network glitch)
        return memoryCache;
    }
}

/**
 * Backwards-compatible helper returning just the numeric rate
 */
export async function fetchLiveBcvRate(forceRefresh = false): Promise<number> {
    const data = await getLiveBcvData(forceRefresh);
    return data.rate;
}

/**
 * Allows setting a custom rate manually from the Admin panel
 */
export function setCustomBcvRate(rate: number): BcvRateData {
    if (rate > 0) {
        const rounded = Math.round(rate * 100) / 100;
        const updatedData: BcvRateData = {
            rate: rounded,
            exactRate: rate,
            rawRate: rate.toFixed(4).replace('.', ','),
            fechaValor: `Ajuste manual del administrador (${new Date().toLocaleDateString('es-VE')})`,
            source: "Ajuste Manual Admin",
            lastUpdated: new Date().toISOString(),
            formattedRate: formatBs(rounded),
            isManual: true
        };

        memoryCache = updatedData;
        lastFetchTimestamp = Date.now();
        saveCacheToDisk(updatedData);
        return updatedData;
    }
    return memoryCache;
}

export function getCurrentBcvRateSync(): number {
    return memoryCache.rate;
}

export function getCurrentBcvDataSync(): BcvRateData {
    return memoryCache;
}

export function formatBs(amountBs: number): string {
    return `Bs. ${amountBs.toLocaleString('es-VE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

export function formatUsd(amountUsd: number): string {
    return `$${amountUsd.toFixed(2)}`;
}
