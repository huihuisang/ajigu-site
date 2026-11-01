export const origin: "https://ajigu.com";
export const legacySites: Record<string, { domain: string; base: string; port: number }>;
export function productPath(site: string, value?: string): string;
export function migrateURL(value: string, site?: string): string;
export function migrateText(value: string, site: string): string;
export function migrateContent<T>(value: T, site?: string): T;
