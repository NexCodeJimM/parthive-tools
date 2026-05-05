/**
 * Prepares "Developer Instructions" cell text for clipboard: removes common
 * preamble lines and copies pretty-printed JSON when a JSON object/array is found.
 */

const INTRO_LINE_PATTERNS = [
  /^[\r\n\s]*Ensure this product(?:'|['\u2019])s backend JSON-LD schema includes:\s*/i,
  /^[\r\n\s]*Ensure this product(?:'|['\u2019])s backend JSON[- ]LD schema includes:?\s*/i,
];

const FENCED_JSON = /```(?:json|ld\+json)?\s*\r?\n?([\s\S]*?)```/gi;

const LD_JSON_SCRIPT =
  /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

export function isDeveloperInstructionsField(fieldLabel: string): boolean {
  const t = fieldLabel.trim().toLowerCase();
  return t === "developer instructions" || t === "developer instruction";
}

function normalizeCellText(raw: string): string {
  return raw
    .replace(/\uFEFF/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[\u201c\u201d\u201e\u2033]/g, '"')
    .replace(/[\u2018\u2019]/g, "'");
}

function decodeBasicHtmlEntities(s: string): string {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/gi, "'");
}

function stripIntroPreamble(raw: string): string {
  let s = raw.trim();
  for (const re of INTRO_LINE_PATTERNS) {
    s = s.replace(re, "").trim();
  }
  return s;
}

function stripAllMarkdownFences(raw: string): string {
  const parts: string[] = [];
  let last = 0;
  const re = new RegExp(FENCED_JSON.source, "gi");
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    parts.push(raw.slice(last, m.index));
    parts.push(m[1]?.trim() ?? "");
    last = m.index + m[0].length;
  }
  parts.push(raw.slice(last));
  const joined = parts.join("\n").trim();
  return joined || raw.trim();
}

/** Drops any leading prose so the first `{` or `[` begins the JSON payload. */
function trimToFirstJsonBracket(s: string): string {
  const m = /[{[]/.exec(s);
  if (!m || m.index === undefined || m.index <= 0) return s;
  return s.slice(m.index);
}

function relaxTrailingCommas(json: string): string {
  let prev = "";
  let cur = json;
  let guard = 0;
  while (cur !== prev && guard++ < 20) {
    prev = cur;
    cur = cur.replace(/,(\s*[}\]])/g, "$1");
  }
  return cur;
}

/**
 * Extracts one top-level JSON value starting at `start` using a bracket stack
 * (handles nested objects/arrays; respects double-quoted strings and escapes).
 */
function scanJsonValueFrom(s: string, start: number): string | null {
  const c0 = s[start];
  if (c0 !== "{" && c0 !== "[") return null;

  const stack: string[] = [];
  let inString = false;
  let escape = false;

  for (let i = start; i < s.length; i++) {
    const c = s[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (inString) {
      if (c === "\\") {
        escape = true;
        continue;
      }
      if (c === '"') inString = false;
      continue;
    }

    if (c === '"') {
      inString = true;
      continue;
    }

    if (c === "{") stack.push("}");
    else if (c === "[") stack.push("]");
    else if (c === "}" || c === "]") {
      const want = stack.pop();
      if (want !== c) return null;
      if (stack.length === 0) return s.slice(start, i + 1);
    }
  }

  return null;
}

function isBrandOrOrganizationType(at: unknown): boolean {
  if (typeof at === "string") {
    return at === "Brand" || at === "Organization";
  }
  if (Array.isArray(at)) {
    return at.some((x) => x === "Brand" || x === "Organization");
  }
  return false;
}

/**
 * Clipboard JSON-LD only: "Aftermarket" → "Part Hive", and drop any parenthetical
 * segment(s) attached right after that word (e.g. "Aftermarket (Yamaha Fitment)" → "Part Hive").
 */
function replaceAftermarketBrandNameWithPartHive(name: string): string {
  if (!/\bAftermarket\b/i.test(name)) return name;
  return name
    .replace(/\bAftermarket\b(?:\s*\([^)]*\))*/gi, "Part Hive")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Clipboard JSON-LD only: when the brand is Yuasa, use exactly "Yuasa" (drops
 * parentheticals and any trailing text such as "Yuasa (OEM)" or "Yuasa Battery").
 */
function normalizeYuasaBrandName(name: string): string {
  const t = name.trim();
  if (!/\bYuasa\b/i.test(t)) return name;
  if (/non[-\s]?yuasa/i.test(t)) return name;
  return "Yuasa";
}

/**
 * Clipboard JSON-LD only: when the brand is Dunlop, use exactly "Dunlop" (drops
 * parentheticals and trailing text such as "Dunlop (OEM)" or "Dunlop Tires").
 */
function normalizeDunlopBrandName(name: string): string {
  const t = name.trim();
  if (!/\bDunlop\b/i.test(t)) return name;
  if (/non[-\s]?dunlop/i.test(t)) return name;
  return "Dunlop";
}

function normalizeClipboardBrandName(name: string): string {
  return normalizeDunlopBrandName(
    normalizeYuasaBrandName(replaceAftermarketBrandNameWithPartHive(name)),
  );
}

function rewriteAftermarketBrandInJsonLd(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(rewriteAftermarketBrandInJsonLd);
  }
  if (value !== null && typeof value === "object") {
    const o = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(o)) {
      out[k] = rewriteAftermarketBrandInJsonLd(v);
    }
    if (isBrandOrOrganizationType(out["@type"]) && typeof out.name === "string") {
      const next = normalizeClipboardBrandName(out.name);
      if (next !== out.name) out.name = next;
    }
    return out;
  }
  return value;
}

function stringifyJsonLdForClipboard(parsed: unknown): string {
  return JSON.stringify(rewriteAftermarketBrandInJsonLd(parsed), null, 2);
}

function tryParsePretty(candidate: string): string | null {
  const trimmed = candidate.trim();
  if (!trimmed) return null;

  const attempts = [trimmed, relaxTrailingCommas(trimmed)];
  for (const t of attempts) {
    try {
      const parsed = JSON.parse(t) as unknown;
      return stringifyJsonLdForClipboard(parsed);
    } catch {
      /* try next */
    }
  }
  return null;
}

function extractFromLdJsonScripts(s: string): string | null {
  LD_JSON_SCRIPT.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = LD_JSON_SCRIPT.exec(s)) !== null) {
    const inner = decodeBasicHtmlEntities(m[1].trim());
    const pretty = tryParsePretty(inner);
    if (pretty) return pretty;
    const fromBalanced = findFirstBalancedJson(inner);
    if (fromBalanced) return fromBalanced;
  }
  return null;
}

/** First valid JSON object/array in `s`, pretty-printed (or null). */
function findFirstBalancedJson(s: string): string | null {
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "{" || s[i] === "[") {
      const chunk = scanJsonValueFrom(s, i);
      if (chunk) {
        const pretty = tryParsePretty(chunk);
        if (pretty) return pretty;
      }
    }
  }
  return null;
}

type LabeledLine = { label: string; value: string };

function normLabelKey(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, " ");
}

function parseLabeledLines(text: string): LabeledLine[] {
  const out: LabeledLine[] = [];
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t) continue;
    const m = /^([^:\n]+):\s*(.*)$/.exec(t);
    if (!m) continue;
    const label = m[1].trim();
    const value = m[2].trim();
    if (!label) continue;
    out.push({ label, value });
  }
  return out;
}

const KNOWN_SPEC_LABELS = new Set([
  "mpn",
  "sku",
  "gtin",
  "gtin8",
  "gtin13",
  "gtin14",
  "name",
  "product name",
  "description",
  "brand",
  "availability",
  "area served",
  "price currency",
  "item condition",
  "price",
]);

function isLikelyKeyValueProductSpec(lines: LabeledLine[]): boolean {
  if (lines.length < 2) return false;
  let knownHits = 0;
  for (const { label } of lines) {
    if (KNOWN_SPEC_LABELS.has(normLabelKey(label))) knownHits++;
  }
  return knownHits >= 1;
}

const COUNTRY_NAME_TO_ISO: Record<string, string> = {
  "united kingdom": "GB",
  uk: "GB",
  "great britain": "GB",
  england: "GB",
  scotland: "GB",
  wales: "GB",
  "northern ireland": "GB",
  "united states": "US",
  usa: "US",
  "united states of america": "US",
  canada: "CA",
  australia: "AU",
  "new zealand": "NZ",
  ireland: "IE",
  germany: "DE",
  france: "FR",
  spain: "ES",
  italy: "IT",
  netherlands: "NL",
  belgium: "BE",
};

function mapCountryCode(value: string): string {
  const k = value.trim().toLowerCase();
  if (COUNTRY_NAME_TO_ISO[k]) return COUNTRY_NAME_TO_ISO[k];
  const t = value.trim();
  if (/^[A-Za-z]{2}$/.test(t)) return t.toUpperCase();
  return t;
}

function mapAvailabilityUrl(value: string): string {
  const t = value.trim().toLowerCase();
  if (t.includes("in stock") || t === "instock" || t === "in_stock")
    return "https://schema.org/InStock";
  if (t.includes("out of stock") || t.includes("sold out"))
    return "https://schema.org/OutOfStock";
  if (t.includes("preorder") || t.includes("pre-order"))
    return "https://schema.org/PreOrder";
  if (t.includes("limited")) return "https://schema.org/LimitedAvailability";
  if (t.includes("discontinued")) return "https://schema.org/Discontinued";
  return "https://schema.org/InStock";
}

function mapItemConditionUrl(value: string): string {
  const t = value.trim().toLowerCase();
  if (t.includes("new")) return "https://schema.org/NewCondition";
  if (t.includes("used")) return "https://schema.org/UsedCondition";
  if (t.includes("refurb")) return "https://schema.org/RefurbishedCondition";
  if (t.includes("damage")) return "https://schema.org/DamagedCondition";
  return "https://schema.org/NewCondition";
}

function coercePrice(value: string): string | number {
  const n = Number.parseFloat(value.replace(/,/g, "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : value;
}

/**
 * Converts "MPN: … / Brand: …" style blocks into Product + Offer JSON-LD.
 */
function tryKeyValueLinesToProductJsonLd(text: string): string | null {
  const lines = parseLabeledLines(text);
  if (!isLikelyKeyValueProductSpec(lines)) return null;

  const product: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
  };
  const offer: Record<string, unknown> = { "@type": "Offer" };
  let hasOffer = false;
  const additional: { "@type": string; name: string; value: string }[] = [];

  for (const { label, value } of lines) {
    if (!value) continue;
    const key = normLabelKey(label);

    switch (key) {
      case "mpn":
        product.mpn = value;
        break;
      case "sku":
        product.sku = value;
        break;
      case "gtin":
      case "gtin8":
      case "gtin13":
      case "gtin14":
        product.gtin = value;
        break;
      case "name":
      case "product name":
        product.name = value;
        break;
      case "description":
        product.description = value;
        break;
      case "brand":
        product.brand = {
          "@type": "Brand",
          name: normalizeClipboardBrandName(value),
        };
        break;
      case "availability":
        offer.availability = mapAvailabilityUrl(value);
        hasOffer = true;
        break;
      case "area served":
        offer.areaServed = {
          "@type": "Country",
          name: mapCountryCode(value),
        };
        hasOffer = true;
        break;
      case "price currency":
        offer.priceCurrency = value.toUpperCase();
        hasOffer = true;
        break;
      case "item condition":
        offer.itemCondition = mapItemConditionUrl(value);
        hasOffer = true;
        break;
      case "price":
        offer.price = coercePrice(value);
        hasOffer = true;
        break;
      default:
        additional.push({
          "@type": "PropertyValue",
          name: label.trim(),
          value,
        });
    }
  }

  if (hasOffer) {
    product.offers = offer;
  }
  if (additional.length === 1) {
    product.additionalProperty = additional[0];
  } else if (additional.length > 1) {
    product.additionalProperty = additional;
  }

  return stringifyJsonLdForClipboard(product);
}

/**
 * Returns text suitable for clipboard: JSON pretty-printed when possible,
 * without leading schema-instruction wording.
 */
export function formatDeveloperInstructionsForClipboard(raw: string): string {
  let s = normalizeCellText(raw);
  s = stripIntroPreamble(s);

  const fromScript = extractFromLdJsonScripts(s);
  if (fromScript) return fromScript;

  s = stripAllMarkdownFences(s);
  s = stripIntroPreamble(s);
  s = decodeBasicHtmlEntities(s);
  const beforeBracketTrim = s;
  s = trimToFirstJsonBracket(s);

  const direct = tryParsePretty(s);
  if (direct) return direct;

  const fromBalanced = findFirstBalancedJson(s);
  if (fromBalanced) return fromBalanced;

  const fromKeyValue = tryKeyValueLinesToProductJsonLd(beforeBracketTrim);
  if (fromKeyValue) return fromKeyValue;

  return s.trim();
}
