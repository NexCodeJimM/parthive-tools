import Link from "next/link";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NMAX125_HREF, PCX125_HREF } from "@/lib/dashboard-nav";
import { ChevronRight } from "lucide-react";

export default function ShopifyProductsPage() {
  return (
    <main className="flex-1 bg-linear-to-b from-muted/40 via-background to-background">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          Shopify Products
        </h1>
        <p className="mb-8 text-sm text-muted-foreground sm:text-base">
          Choose a product line to search the live Google Sheet export.
        </p>

        <div className="flex flex-col gap-4">
          <Link
            href={NMAX125_HREF}
            className="block rounded-xl outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Card className="border-border/80 transition-colors hover:border-border hover:bg-muted/20">
              <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <CardTitle className="text-lg">NMAX 125</CardTitle>
                  <CardDescription>
                    Search by Variant SKU or Part Number and view all sheet columns.
                  </CardDescription>
                </div>
                <ChevronRight
                  className="size-5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
              </CardHeader>
            </Card>
          </Link>

          <Link
            href={PCX125_HREF}
            className="block rounded-xl outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Card className="border-border/80 transition-colors hover:border-border hover:bg-muted/20">
              <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <CardTitle className="text-lg">PCX 125</CardTitle>
                  <CardDescription>
                    Search by Variant SKU or Part Number and view all sheet columns.
                  </CardDescription>
                </div>
                <ChevronRight
                  className="size-5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </main>
  );
}
