// BCV Dollar Rate Helper & Cache

let cachedRate: number = 886.23;
let lastFetchTime: number = 0;
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes cache

export async function fetchLiveBcvRate(): Promise<number> {
    const now = Date.now();
    // Return cache if fresh
    if (lastFetchTime > 0 && (now - lastFetchTime) < CACHE_TTL_MS) {
        return cachedRate;
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
            signal: controller.signal,
            next: { revalidate: 1800 } // Next.js revalidation
        });
        clearTimeout(timeoutId);

        if (res.ok) {
            const data = await res.json();
            if (data && typeof data.promedio === 'number' && data.promedio > 0) {
                cachedRate = Math.round(data.promedio * 100) / 100;
                lastFetchTime = now;
                return cachedRate;
            }
        }
    } catch {
        // Fall back to cachedRate
    }

    return cachedRate;
}

export function setCustomBcvRate(rate: number): number {
    if (rate > 0) {
        cachedRate = Math.round(rate * 100) / 100;
        lastFetchTime = Date.now();
    }
    return cachedRate;
}

export function getCurrentBcvRateSync(): number {
    return cachedRate;
}

export function formatBs(amountBs: number): string {
    return new Intl.NumberFormat('es-VE', {
        style: 'currency',
        currency: 'VED',
        currencyDisplay: 'narrowSymbol',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amountBs).replace('VED', 'Bs.').trim();
}

export function formatUsd(amountUsd: number): string {
    return `$${amountUsd.toFixed(2)}`;
}
