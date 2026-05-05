import { ShopifyProductSearch } from "@/components/shopify-product-search";

export default function Pcx125Page() {
  return (
    <main className="flex-1 bg-linear-to-b from-muted/40 via-background to-background">
      <ShopifyProductSearch
        tabId="pcx125"
        panelTitle="PCX 125 — Product Lookup"
        historyStorageKey="parthive-tools-pcx125-search-history"
      />
    </main>
  );
}
