import { NextResponse } from "next/server";

import {
  fetchShopifyTabCsv,
  parseShopifyTabRows,
  searchShopifyTabRows,
} from "@/lib/shopify/shopify-product-sheet";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!q) {
    return NextResponse.json(
      { error: "Missing query parameter \"q\" (Variant SKU or Part Number)." },
      { status: 400 },
    );
  }

  try {
    const csv = await fetchShopifyTabCsv("pcx125");
    const rows = parseShopifyTabRows(csv, "pcx125");
    const matches = searchShopifyTabRows(rows, q);
    return NextResponse.json({ matches });
  } catch {
    return NextResponse.json(
      { error: "Could not load the Google Sheet. Check sharing and try again." },
      { status: 502 },
    );
  }
}
