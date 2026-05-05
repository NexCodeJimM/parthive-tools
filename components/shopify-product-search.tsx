"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
  rowEntriesForDisplay,
  shopifyTabSearchApiPath,
  type ShopifyProductTabId,
} from "@/lib/shopify/shopify-product-sheet";
import { CircleCheckIcon, Copy, History, Search } from "lucide-react";
import { toast } from "sonner";

type MatchRow = Record<string, string>;

const SEARCH_HISTORY_MAX = 5;

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

function copyFieldToClipboard(fieldLabel: string, text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;

  const payload = isDeveloperInstructionsField(fieldLabel)
    ? formatDeveloperInstructionsForClipboard(text)
    : trimmed;

  if (!payload.trim()) return;

  void navigator.clipboard.writeText(payload).then(
    () => {
      toast.success(`Copied to ${fieldLabel}`, {
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
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<MatchRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const executeSearch = useCallback(
    async (rawQuery: string) => {
      const q = rawQuery.trim();
      setQuery(q);
      if (!q) {
        setError("Enter a Variant SKU or Part Number.");
        setMatches(null);
        return;
      }

      setLoading(true);
      setError(null);
      setHistoryOpen(false);
      try {
        const api = shopifyTabSearchApiPath(tabId);
        const res = await fetch(`${api}?q=${encodeURIComponent(q)}`);
        const data = (await res.json()) as {
          matches?: MatchRow[];
          error?: string;
        };

        if (!res.ok) {
          setError(data.error ?? "Search failed.");
          setMatches(null);
          return;
        }

        appendSearchHistory(q);
        setMatches(data.matches ?? []);
      } catch {
        setError("Network error. Try again.");
        setMatches(null);
      } finally {
        setLoading(false);
      }
    },
    [appendSearchHistory, tabId],
  );

  const runSearch = useCallback(() => {
    void executeSearch(query);
  }, [executeSearch, query]);

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
      <Card className="border-border/80 shadow-md shadow-black/5 dark:shadow-black/20">
        <CardHeader className="space-y-2 border-b border-border/60 pb-4">
          <CardTitle className="text-xl font-semibold tracking-tight sm:text-2xl">
            {panelTitle}
          </CardTitle>
          <CardDescription className="text-pretty">
            Search by <span className="font-medium text-foreground">Variant SKU</span>{" "}
            or <span className="font-medium text-foreground">Part Number</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          <div className="flex w-full min-w-0 flex-col gap-3">
            <Label htmlFor={searchInputId} className="w-full text-sm font-medium">
              Variant SKU or Part Number
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
                    if (e.key === "Enter") void executeSearch(query);
                  }}
                  placeholder="e.g. FLTGY2DP44510000 or 2DP-E4451-00"
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
                            void executeSearch(item);
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
                onClick={() => void runSearch()}
                disabled={loading}
              >
                <Search className="size-4 shrink-0" aria-hidden />
                {loading ? "Searching…" : "Search"}
              </Button>
            </div>
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
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
                  {rowEntriesForDisplay(row, tabId).map(([label, value]) => (
                    <div
                      key={label}
                      className="grid gap-2 px-4 py-3 sm:grid-cols-[minmax(10rem,14rem)_1fr] sm:items-start sm:gap-4 sm:py-3.5"
                    >
                      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground sm:text-sm sm:normal-case sm:tracking-normal">
                        {label}
                      </dt>
                      <dd className="flex min-w-0 items-start gap-2">
                        <span className="min-w-0 flex-1 whitespace-pre-wrap break-words text-sm text-foreground">
                          {value || "—"}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                          disabled={!value.trim()}
                          aria-label={`Copy ${label}`}
                          onClick={() => copyFieldToClipboard(label, value)}
                        >
                          <Copy className="size-4" aria-hidden />
                        </Button>
                      </dd>
                    </div>
                  ))}
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
