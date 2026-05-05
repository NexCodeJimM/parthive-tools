import Papa from "papaparse";

const DEFAULT_SHEET_ID = "1xk-ATxP0_UZZDKZJVgmr68CpjTexqOdZgl9HwaK-XPI";

/** Shared "Product Features" tab (NMAX + PCX + other models); join on Warehouse SKU ↔ Variant SKU. */
const PRODUCT_FEATURES_GID =
  process.env.GOOGLE_SHEET_PRODUCT_FEATURES_GID ?? "1456262557";

export const PRODUCT_FEATURES_MERGE_FIELDS = [
  "Product Overview",
  "Key Features",
  "Perfect for",
] as const;

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
  "Product Overview",
  "Key Features",
  "Perfect for",
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
  "Product Overview",
  "Key Features",
  "Perfect for",
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

function productFeaturesSheetId(): string {
  return (
    process.env.GOOGLE_SHEET_PRODUCT_FEATURES_SHEET_ID ??
    process.env.GOOGLE_SHEET_NMAX125_ID ??
    DEFAULT_SHEET_ID
  );
}

export function getProductFeaturesCsvUrl(): string {
  const sheetId = productFeaturesSheetId();
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${PRODUCT_FEATURES_GID}`;
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

export async function fetchProductFeaturesCsv(): Promise<string> {
  const sheetId = productFeaturesSheetId();
  const cacheKey = `${sheetId}:${PRODUCT_FEATURES_GID}:product-features`;
  const now = Date.now();
  const hit = csvCaches.get(cacheKey);
  if (hit && now - hit.fetchedAt < CACHE_MS) {
    return hit.text;
  }

  const url = getProductFeaturesCsvUrl();
  const res = await fetch(url, {
    cache: "no-store",
    headers: { Accept: "text/csv" },
  });

  if (!res.ok) {
    throw new Error(`Product Features sheet HTTP ${res.status}`);
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

/**
 * Parses the "Product Features" tab: row 0 = headers, match column "Warehouse SKU",
 * merge fields PRODUCT_FEATURES_MERGE_FIELDS (case-insensitive header match).
 */
export function parseProductFeaturesByWarehouseSku(
  csv: string,
): Map<string, Record<string, string>> {
  const parsed = Papa.parse<string[]>(csv, {
    header: false,
    skipEmptyLines: false,
  });

  const raw = parsed.data as string[][];
  if (raw.length < 2) return new Map();

  const headerRow = raw[0].map((c) => String(c ?? "").trim());
  const warehouseIdx = headerRow.findIndex(
    (h) => h.trim().toLowerCase() === "warehouse sku",
  );
  if (warehouseIdx === -1) return new Map();

  const fieldIndices: { canonical: string; idx: number }[] = [];
  for (const canonical of PRODUCT_FEATURES_MERGE_FIELDS) {
    const idx = headerRow.findIndex(
      (h) => h.trim().toLowerCase() === canonical.toLowerCase(),
    );
    if (idx !== -1) fieldIndices.push({ canonical, idx });
  }
  if (fieldIndices.length === 0) return new Map();

  const map = new Map<string, Record<string, string>>();
  for (let r = 1; r < raw.length; r++) {
    const cells = raw[r] ?? [];
    const sku = String(cells[warehouseIdx] ?? "").trim();
    if (!sku) continue;

    const rec: Record<string, string> = {};
    for (const { canonical, idx } of fieldIndices) {
      rec[canonical] = String(cells[idx] ?? "").trim();
    }
    map.set(sku.toLowerCase(), rec);
  }

  return map;
}

export function mergeProductFeaturesIntoRow(
  row: Record<string, string>,
  byWarehouseSku: Map<string, Record<string, string>>,
): Record<string, string> {
  const variantSku = getCell(row, "Variant SKU").trim();
  if (!variantSku) return row;

  const feat = byWarehouseSku.get(variantSku.toLowerCase());
  if (!feat) return row;

  return { ...row, ...feat };
}

/**
 * Loads main tab + Product Features, searches main tab, enriches each match by
 * Variant SKU = Warehouse SKU on the features tab. If the features sheet fails
 * to load, returns main-tab matches only.
 */
export async function searchShopifyTabWithProductFeatures(
  tabId: ShopifyProductTabId,
  query: string,
): Promise<Record<string, string>[]> {
  const mainCsv = await fetchShopifyTabCsv(tabId);
  const rows = parseShopifyTabRows(mainCsv, tabId);
  const matches = searchShopifyTabRows(rows, query);

  let bySku = new Map<string, Record<string, string>>();
  try {
    const featuresCsv = await fetchProductFeaturesCsv();
    bySku = parseProductFeaturesByWarehouseSku(featuresCsv);
  } catch {
    /* keep matches without merged fields */
  }

  if (bySku.size === 0) return matches;
  return matches.map((row) => mergeProductFeaturesIntoRow(row, bySku));
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

/** UI label only; sheet keys stay "Developer Instruction(s)" for CSV matching & clipboard formatting. */
export function getFieldDisplayLabel(label: string): string {
  const t = label.trim().toLowerCase();
  if (t === "developer instructions" || t === "developer instruction") {
    return "JSON-LD";
  }
  return label;
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

