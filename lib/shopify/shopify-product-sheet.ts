import Papa from "papaparse";

const DEFAULT_SHEET_ID = "1xk-ATxP0_UZZDKZJVgmr68CpjTexqOdZgl9HwaK-XPI";

export type ShopifyProductTabId = "nmax125" | "pcx125";

export function shopifyTabSearchApiPath(tabId: ShopifyProductTabId): string {
  if (tabId === "nmax125") return "/api/shopify-products/nmax-125/search";
  return "/api/shopify-products/pcx-125/search";
}

type TabConfig = {
  sheetId: string;
  gid: string;
  /** 0-based CSV row index containing header cells */
  headerRowIndex: number;
  fieldOrder: readonly string[];
};

export const NMAX125_FIELD_ORDER = [
  "Category Pages",
  "Part Name",
  "Type",
  "tags",
  "Variant SKU",
  "CCM",
  "Make",
  "MFG",
  "Model",
  "Part Number",
  "Street Name",
  "URL handle",
  "Target Hub",
  "Keyword Used",
  "Meta Title",
  "Meta Description",
  "H1",
  "GEO Answer Block",
  "Mechanic Insights",
  "Core Bullet Points",
  "Internal Cross selling",
  "Optional SEO Image Alt Text",
  "Optional Short Product Description",
  "Developer Instructions",
  "Shopify product tags",
] as const;

export const PCX125_FIELD_ORDER = [
  "Category Pages",
  "Part Name",
  "Variant SKU",
  "Part Number",
  "URL Handle",
  "Meta Title",
  "Meta Description",
  "Shopify Product Tags",
  "H1",
  "Optional Short Product Description",
  "GEO Answer Block",
  "Mechanic Insights",
  "Developer Instruction",
] as const;

function tabConfig(tabId: ShopifyProductTabId): TabConfig {
  if (tabId === "nmax125") {
    return {
      sheetId: process.env.GOOGLE_SHEET_NMAX125_ID ?? DEFAULT_SHEET_ID,
      gid: process.env.GOOGLE_SHEET_NMAX125_GID ?? "923344245",
      headerRowIndex: 1,
      fieldOrder: NMAX125_FIELD_ORDER,
    };
  }
  return {
    sheetId: process.env.GOOGLE_SHEET_PCX125_ID ?? DEFAULT_SHEET_ID,
    gid: process.env.GOOGLE_SHEET_PCX125_GID ?? "193744408",
    headerRowIndex: 0,
    fieldOrder: PCX125_FIELD_ORDER,
  };
}

export function getShopifyTabCsvUrl(tabId: ShopifyProductTabId): string {
  const c = tabConfig(tabId);
  return `https://docs.google.com/spreadsheets/d/${c.sheetId}/export?format=csv&gid=${c.gid}`;
}

const csvCaches = new Map<string, { text: string; fetchedAt: number }>();
const CACHE_MS = 5 * 60 * 1000;

export async function fetchShopifyTabCsv(tabId: ShopifyProductTabId): Promise<string> {
  const c = tabConfig(tabId);
  const cacheKey = `${c.sheetId}:${c.gid}`;
  const now = Date.now();
  const hit = csvCaches.get(cacheKey);
  if (hit && now - hit.fetchedAt < CACHE_MS) {
    return hit.text;
  }

  const url = getShopifyTabCsvUrl(tabId);
  const res = await fetch(url, {
    cache: "no-store",
    headers: { Accept: "text/csv" },
  });

  if (!res.ok) {
    throw new Error(`Sheet HTTP ${res.status}`);
  }

  const text = await res.text();
  csvCaches.set(cacheKey, { text, fetchedAt: now });
  return text;
}

/**
 * Parses CSV: header row at `headerRowIndex` (0-based), data rows follow.
 * Do not pre-filter rows before indexing (row alignment).
 */
export function parseShopifyTabRows(
  csv: string,
  tabId: ShopifyProductTabId,
): Record<string, string>[] {
  const { headerRowIndex } = tabConfig(tabId);
  const parsed = Papa.parse<string[]>(csv, {
    header: false,
    skipEmptyLines: false,
  });

  const raw = parsed.data as string[][];
  if (raw.length <= headerRowIndex + 1) return [];

  const headers = raw[headerRowIndex].map((c) => String(c ?? "").trim());
  const body = raw.slice(headerRowIndex + 1);

  return body
    .map((cells) => {
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        if (!h) return;
        row[h] = String(cells[i] ?? "").trim();
      });
      return row;
    })
    .filter((row) => Object.values(row).some((v) => v !== ""));
}

export function findColumnKey(
  row: Record<string, string>,
  canonical: string,
): string | undefined {
  const t = canonical.trim().toLowerCase();
  return Object.keys(row).find((k) => k.trim().toLowerCase() === t);
}

export function getCell(row: Record<string, string>, canonical: string): string {
  const key = findColumnKey(row, canonical);
  return key ? row[key] ?? "" : "";
}

export function searchShopifyTabRows(
  rows: Record<string, string>[],
  query: string,
): Record<string, string>[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return rows.filter((row) => {
    const sku = getCell(row, "Variant SKU").trim().toLowerCase();
    const part = getCell(row, "Part Number").trim().toLowerCase();
    return sku === q || part === q;
  });
}

export function rowEntriesForDisplay(
  row: Record<string, string>,
  tabId: ShopifyProductTabId,
): [string, string][] {
  const { fieldOrder } = tabConfig(tabId);
  const used = new Set<string>();
  const out: [string, string][] = [];

  for (const label of fieldOrder) {
    const key = findColumnKey(row, label);
    if (key && !used.has(key)) {
      used.add(key);
      out.push([key, row[key] ?? ""]);
    }
  }

  const rest = Object.keys(row)
    .filter((k) => !used.has(k))
    .sort((a, b) => a.localeCompare(b));
  for (const key of rest) {
    out.push([key, row[key] ?? ""]);
  }

  return out;
}

