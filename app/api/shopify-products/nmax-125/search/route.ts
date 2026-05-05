import { NextResponse } from "next/server";

import { searchShopifyTabWithProductFeatures } from "@/lib/shopify/shopify-product-sheet";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!q) {
    return NextResponse.json(
      { error: "Missing query parameter \"q\" (Variant SKU or Part Number)." },
      { status: 400 },
    );
  }

  try {
    const matches = await searchShopifyTabWithProductFeatures("nmax125", q);
    return NextResponse.json({ matches });
  } catch {
    return NextResponse.json(
      { error: "Could not load the Google Sheet. Check sharing and try again." },
      { status: 502 },
    );
  }
}
