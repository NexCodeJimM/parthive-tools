import { Suspense } from "react";

import { ShopifyProductSearch } from "@/components/shopify-product-search";

function SearchSkeleton() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse px-4 py-8 sm:px-6 sm:py-10">
      <div className="h-44 rounded-xl border border-border/60 bg-muted/25" />
    </div>
  );
}

export default function Pcx125Page() {
  return (
    <main className="flex-1 bg-linear-to-b from-muted/40 via-background to-background">
      <Suspense fallback={<SearchSkeleton />}>
        <ShopifyProductSearch
          tabId="pcx125"
          panelTitle="PCX 125 — Product Lookup"
          historyStorageKey="parthive-tools-pcx125-search-history"
        />
      </Suspense>
    </main>
  );
}
