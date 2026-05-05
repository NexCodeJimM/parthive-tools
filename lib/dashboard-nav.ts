/** Primary app area: eBay listing HTML / description tooling. */
export const EBAY_DESCRIPTOR_HREF = "/";

export const SHOPIFY_PRODUCTS_HREF = "/shopify-products";
export const NMAX125_HREF = "/shopify-products/nmax-125";
export const PCX125_HREF = "/shopify-products/pcx-125";

export function getDashboardTopBar(pathname: string): {
  section: string;
  page: string;
} {
  const path = pathname.split("?")[0] ?? "/";

  if (
    path === "/shopify-products/nmax-125" ||
    path.startsWith("/shopify-products/nmax-125/")
  ) {
    return { section: "Shopify Products", page: "NMAX 125" };
  }
  if (
    path === "/shopify-products/pcx-125" ||
    path.startsWith("/shopify-products/pcx-125/")
  ) {
    return { section: "Shopify Products", page: "PCX 125" };
  }
  if (path === "/shopify-products" || path.startsWith("/shopify-products/")) {
    return { section: "Shopify Products", page: "Overview" };
  }
  if (path === "/" || path === "") {
    return { section: "eBay Descriptor", page: "Description generator" };
  }

  return { section: "Dashboard", page: "Page" };
}

export function getDashboardPageTitle(pathname: string): string {
  return getDashboardTopBar(pathname).page;
}

const DOCUMENT_TITLE_SUFFIX = "Part Hive Tools";

/** Browser tab title for the current dashboard route. */
export function getDashboardDocumentTitle(pathname: string): string {
  const { page } = getDashboardTopBar(pathname);
  return `${page} · ${DOCUMENT_TITLE_SUFFIX}`;
}
