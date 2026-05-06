"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  formatDeveloperInstructionsForClipboard,
  isDeveloperInstructionsField,
} from "@/lib/shopify/format-developer-instructions-copy";
import {
  getCell,
  getFieldDisplayLabel,
  rowEntriesForDisplay,
  shopifyTabSearchApiPath,
  type ShopifyProductTabId,
} from "@/lib/shopify/shopify-product-sheet";
import { CircleCheckIcon, Copy, History, Search } from "lucide-react";
import { toast } from "sonner";

type MatchRow = Record<string, string>;

const SEARCH_HISTORY_MAX = 5;

const HIDDEN_RESULT_FIELDS = new Set(
  [
    "Category Pages",
    "Part Name",
    "Alternative Part Number",
    "Core Bullet Points",
    "—",
    "CCM",
    "Internal Cross selling",
    "Keyword used",
    "Street Name",
    "Tags",
    "Target Hub",
    "Type",
    "With Copy",
    "Year",
  ].map((x) => x.trim().toLowerCase()),
);

function shouldHideResultFieldLabel(label: string): boolean {
  return HIDDEN_RESULT_FIELDS.has(label.trim().toLowerCase());
}

/** Appended to sheet value when copying / displaying Product Compatibility (only if cell has content). */
const PRODUCT_COMPATIBILITY_DEFAULT_FOOTER = `Compatibility charts are for reference only. Please compare part numbers and
manufacturers' details. Contact us before ordering if unsure to avoid delays or refund
charges.

Trademark Disclaimer: All trademarks, brand names, and logos remain the property of their respective owners and are used solely for identification and compatibility purposes.
We are an independent retailer and are not affiliated with any authorized dealer or
distributor.`;

/** Sheet sometimes uses "Compatability" (common misspelling). */
function isProductCompatibilityField(label: string): boolean {
  const n = label
    .trim()
    .toLowerCase()
    .replaceAll("compatability", "compatibility");
  return n === "product compatibility";
}

/** Sheet text plus footer; returns "" if the product cell is empty. */
function productCompatibilityDisplayValue(raw: string): string {
  const body = raw.trim();
  if (!body) return "";
  return `${body}\n\n${PRODUCT_COMPATIBILITY_DEFAULT_FOOTER}`;
}

const CLIPBOARD_BULLET = "\u2022";

function isBulletListField(label: string): boolean {
  const n = label.trim().toLowerCase();
  return n === "key features" || n === "perfect for";
}

/** Strip common leading markers so list items dedupe with UI bullets. */
function stripLeadingBulletMarker(line: string): string {
  let s = line.trim();
  s = s.replace(/^[•\u2022\u25cf▪·]\s*/i, "");
  s = s.replace(/^[-*]\s+/, "");
  s = s.replace(/^\d+[.)]\s+/, "");
  return s.trim();
}

/** Split cell text into feature lines (newline-separated; trims bullet/number prefixes per line). */
function splitIntoListItems(raw: string): string[] {
  const t = raw.trim();
  if (!t) return [];
  const lines = t
    .split(/\r?\n+/)
    .map((s) => stripLeadingBulletMarker(s))
    .filter(Boolean);
  if (lines.length > 0) return lines;
  return [stripLeadingBulletMarker(t)];
}

function bulletListClipboardText(items: string[]): string {
  return items.map((item) => `${CLIPBOARD_BULLET} ${item}`).join("\n");
}

function clipboardPayloadForField(label: string, value: string): string {
  if (isProductCompatibilityField(label)) {
    return productCompatibilityDisplayValue(value);
  }
  if (isBulletListField(label)) {
    const items = splitIntoListItems(value);
    if (items.length === 0) return "";
    return bulletListClipboardText(items);
  }
  return value;
}

function loadSearchHistory(storageKey: string): string[] {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is string => typeof x === "string")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, SEARCH_HISTORY_MAX);
  } catch {
    return [];
  }
}

function persistSearchHistory(storageKey: string, entries: string[]) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(entries));
  } catch {
    /* ignore */
  }
}

function copyFieldToClipboard(
  fieldLabel: string,
  text: string,
  toastLabel?: string,
) {
  const trimmed = text.trim();
  if (!trimmed) return;

  const payload = isDeveloperInstructionsField(fieldLabel)
    ? formatDeveloperInstructionsForClipboard(text)
    : trimmed;

  if (!payload.trim()) return;

  const successLabel = toastLabel ?? fieldLabel;

  void navigator.clipboard.writeText(payload).then(
    () => {
      toast.success(`Copied to ${successLabel}`, {
        position: "bottom-right",
        icon: (
          <CircleCheckIcon className="size-5 shrink-0 text-white" aria-hidden />
        ),
        style: {
          background: "rgb(22 163 74)",
          color: "rgb(255 255 255)",
          border: "1px solid rgb(21 128 61)",
        },
      });
    },
    () => {
      toast.error("Could not copy to clipboard.", { position: "bottom-right" });
    },
  );
}

export type ShopifyProductSearchProps = {
  tabId: ShopifyProductTabId;
  panelTitle: string;
  historyStorageKey: string;
};

export function ShopifyProductSearch({
  tabId,
  panelTitle,
  historyStorageKey,
}: ShopifyProductSearchProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const urlQuery = (searchParams.get("q") ?? "").trim();

  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<MatchRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const searchBlockRef = useRef<HTMLDivElement>(null);
  const searchInputId = `shopify-search-${tabId}`;

  useEffect(() => {
    setSearchHistory(loadSearchHistory(historyStorageKey));
  }, [historyStorageKey]);

  const appendSearchHistory = useCallback(
    (term: string) => {
      const t = term.trim();
      if (!t) return;
      setSearchHistory((prev) => {
        const next = [
          t,
          ...prev.filter((h) => h.toLowerCase() !== t.toLowerCase()),
        ].slice(0, SEARCH_HISTORY_MAX);
        persistSearchHistory(historyStorageKey, next);
        return next;
      });
    },
    [historyStorageKey],
  );

  useEffect(() => {
    setQuery(urlQuery);

    if (!urlQuery) {
      setMatches(null);
      setError(null);
      setLoading(false);
      return;
    }

    setValidationError(null);

    let cancelled = false;
    setLoading(true);
    setError(null);
    setHistoryOpen(false);

    void (async () => {
      try {
        const api = shopifyTabSearchApiPath(tabId);
        const res = await fetch(`${api}?q=${encodeURIComponent(urlQuery)}`);
        const data = (await res.json()) as {
          matches?: MatchRow[];
          error?: string;
        };

        if (cancelled) return;

        if (!res.ok) {
          setError(data.error ?? "Search failed.");
          setMatches(null);
          return;
        }

        appendSearchHistory(urlQuery);
        setMatches(data.matches ?? []);
      } catch {
        if (!cancelled) {
          setError("Network error. Try again.");
          setMatches(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [appendSearchHistory, tabId, urlQuery]);

  const commitSearchToUrl = useCallback(() => {
    const q = query.trim();
    if (!q) {
      setValidationError("Enter a Variant SKU.");
      router.replace(pathname, { scroll: false });
      return;
    }
    setValidationError(null);
    setError(null);
    router.replace(`${pathname}?q=${encodeURIComponent(q)}`, {
      scroll: false,
    });
  }, [query, router, pathname]);

  const applyHistorySearch = useCallback(
    (raw: string) => {
      const q = raw.trim();
      if (!q) return;
      setValidationError(null);
      setError(null);
      setHistoryOpen(false);
      router.replace(`${pathname}?q=${encodeURIComponent(q)}`, {
        scroll: false,
      });
    },
    [router, pathname],
  );

  const combinedError = validationError ?? error;

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
      <Card className="border-border/80 shadow-md shadow-black/5 dark:shadow-black/20">
        <CardHeader className="space-y-2 border-b border-border/60 pb-4">
          <CardTitle className="text-xl font-semibold tracking-tight sm:text-2xl">
            {panelTitle}
          </CardTitle>
          <CardDescription className="text-pretty">
            Search by <span className="font-medium text-foreground">Variant SKU</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          <div className="flex w-full min-w-0 flex-col gap-3">
            <Label htmlFor={searchInputId} className="w-full text-sm font-medium">
              Variant SKU
            </Label>
            <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
              <div
                ref={searchBlockRef}
                className="relative w-full min-w-0 sm:flex-1"
              >
                <Input
                  id={searchInputId}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => {
                    if (searchHistory.length > 0) setHistoryOpen(true);
                  }}
                  onBlur={(e) => {
                    if (
                      searchBlockRef.current?.contains(
                        e.relatedTarget as Node | null,
                      )
                    ) {
                      return;
                    }
                    setHistoryOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setHistoryOpen(false);
                      return;
                    }
                    if (e.key === "Enter") commitSearchToUrl();
                  }}
                  placeholder="e.g. FLTGY2DP44510000"
                  autoComplete="off"
                  disabled={loading}
                  className="h-10 w-full min-w-0 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={loading || searchHistory.length === 0}
                  className="absolute right-0.5 top-1/2 z-10 h-9 w-9 -translate-y-1/2 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
                  aria-label="Toggle search history"
                  aria-expanded={historyOpen}
                  aria-haspopup="menu"
                  onMouseDown={(e) => {
                    e.preventDefault();
                  }}
                  onClick={() => {
                    if (searchHistory.length === 0) return;
                    setHistoryOpen((open) => !open);
                  }}
                >
                  <History className="size-4 shrink-0" aria-hidden />
                </Button>
                {historyOpen && searchHistory.length > 0 ? (
                  <ul
                    aria-label="Recent searches"
                    className="absolute top-full z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-popover py-1 text-popover-foreground shadow-md"
                  >
                    {searchHistory.map((item) => (
                      <li key={item}>
                        <button
                          type="button"
                          className="flex w-full items-center truncate px-3 py-2.5 text-left text-sm hover:bg-muted"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            applyHistorySearch(item);
                          }}
                        >
                          {item}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <Button
                type="button"
                className="h-10 w-full shrink-0 gap-2 sm:w-auto sm:min-w-32"
                onClick={() => commitSearchToUrl()}
                disabled={loading}
              >
                <Search className="size-4 shrink-0" aria-hidden />
                {loading ? "Searching…" : "Search"}
              </Button>
            </div>
          </div>

          {combinedError ? (
            <p className="text-sm text-destructive" role="alert">
              {combinedError}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {matches !== null ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {matches.length === 0
              ? "No rows matched that SKU or Part Number."
              : `${matches.length} matching row${matches.length === 1 ? "" : "s"}.`}
          </p>

          {matches.map((row, idx) => (
            <Card
              key={`${getStableRowKey(row)}-${idx}`}
              className="border-border/80 overflow-hidden shadow-sm"
            >
              <CardHeader className="bg-muted/30 py-3">
                <CardTitle className="text-base font-medium">
                  Match {idx + 1}
                  {getCell(row, "Variant SKU") ? (
                    <span className="ml-2 font-normal text-muted-foreground">
                      · {getCell(row, "Variant SKU")}
                    </span>
                  ) : null}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <dl className="divide-y divide-border/80">
                  {rowEntriesForDisplay(row, tabId)
                    .filter(([label]) => !shouldHideResultFieldLabel(label))
                    .map(([label, value]) => {
                      const displayLabel = getFieldDisplayLabel(label);
                      const bulletItems = isBulletListField(label)
                        ? splitIntoListItems(value)
                        : [];
                      const showBulletList = bulletItems.length > 0;

                      const compatShown = isProductCompatibilityField(label)
                        ? productCompatibilityDisplayValue(value)
                        : "";

                      const plainShown =
                        !showBulletList && !compatShown
                          ? value || "—"
                          : null;

                      return (
                    <div
                      key={label}
                      className="grid gap-2 px-4 py-3 sm:grid-cols-[minmax(10rem,14rem)_1fr] sm:items-start sm:gap-4 sm:py-3.5"
                    >
                      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground sm:text-sm sm:normal-case sm:tracking-normal">
                        {displayLabel}
                      </dt>
                      <dd className="flex min-w-0 items-start gap-2">
                        <div className="min-w-0 flex-1 text-sm text-foreground">
                          {showBulletList ? (
                            <ul className="list-disc space-y-1.5 pl-5">
                              {bulletItems.map((item, i) => (
                                <li
                                  key={`${label}-${i}-${item.slice(0, 24)}`}
                                  className="whitespace-pre-wrap break-words"
                                >
                                  {item}
                                </li>
                              ))}
                            </ul>
                          ) : compatShown ? (
                            <span className="block whitespace-pre-wrap break-words">
                              {compatShown}
                            </span>
                          ) : (
                            <span className="block whitespace-pre-wrap break-words">
                              {plainShown}
                            </span>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                          disabled={!value.trim()}
                          aria-label={`Copy ${displayLabel}`}
                          onClick={() =>
                            copyFieldToClipboard(
                              label,
                              clipboardPayloadForField(label, value),
                              displayLabel,
                            )
                          }
                        >
                          <Copy className="size-4" aria-hidden />
                        </Button>
                      </dd>
                    </div>
                      );
                    })}
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function getStableRowKey(row: MatchRow): string {
  const sku = Object.entries(row).find(
    ([k]) => k.trim().toLowerCase() === "variant sku",
  )?.[1];
  const part = Object.entries(row).find(
    ([k]) => k.trim().toLowerCase() === "part number",
  )?.[1];
  return `${sku ?? ""}|${part ?? ""}`;
}
