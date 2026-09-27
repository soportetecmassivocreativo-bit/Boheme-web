import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function parseImages(imagesString: any): string[] {
    if (!imagesString) return [];
    if (Array.isArray(imagesString)) return imagesString;
    try {
        return JSON.parse(imagesString);
    } catch {
        return [imagesString];
    }
}