import { ShopifyProductSearch } from "@/components/shopify-product-search";

export default function Nmax125Page() {
  return (
    <main className="flex-1 bg-linear-to-b from-muted/40 via-background to-background">
      <ShopifyProductSearch
        tabId="nmax125"
        panelTitle="NMAX 125 — Product Lookup"
        historyStorageKey="parthive-tools-nmax125-search-history"
      />
    </main>
  );
}
