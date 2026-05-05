"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { DashboardPageFooter } from "@/components/dashboard-page-footer";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  EBAY_DESCRIPTOR_HREF,
  getDashboardDocumentTitle,
  getDashboardTopBar,
  NMAX125_HREF,
  PCX125_HREF,
  SHOPIFY_PRODUCTS_HREF,
} from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  LayoutGrid,
  Menu,
  ShoppingBag,
  X,
} from "lucide-react";

type DashboardChromeProps = {
  children: React.ReactNode;
};

export function DashboardChrome({ children }: DashboardChromeProps) {
  const pathname = usePathname() ?? "/";
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [shopifyNavOpen, setShopifyNavOpen] = useState(() =>
    pathname.startsWith(SHOPIFY_PRODUCTS_HREF),
  );
  const { section: topSection, page: topPage } = getDashboardTopBar(pathname);
  const ebayDescriptorActive = pathname === EBAY_DESCRIPTOR_HREF;
  const shopifySectionActive = pathname.startsWith(SHOPIFY_PRODUCTS_HREF);
  const shopifyOverviewActive = pathname === SHOPIFY_PRODUCTS_HREF;
  const nmax125Active = pathname === NMAX125_HREF;
  const pcx125Active = pathname === PCX125_HREF;

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      setMobileNavOpen(false);
    });
    return () => window.cancelAnimationFrame(id);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      setShopifyNavOpen(pathname.startsWith(SHOPIFY_PRODUCTS_HREF));
    });
    return () => window.cancelAnimationFrame(id);
  }, [pathname]);

  useEffect(() => {
    document.title = getDashboardDocumentTitle(pathname);
  }, [pathname]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background lg:flex-row">
      {mobileNavOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px] lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(17.5rem,88vw)] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-lg transition-transform duration-200 ease-out lg:sticky lg:top-0 lg:z-auto lg:h-[100dvh] lg:max-h-screen lg:w-64 lg:min-w-64 lg:shrink-0 lg:self-start lg:translate-x-0 lg:overflow-y-auto lg:shadow-none",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border px-3 sm:px-4 lg:h-[4.5rem]">
          <Link
            href="/"
            className="flex min-w-0 flex-1 items-center rounded-md py-1 outline-none ring-sidebar-ring transition-opacity hover:opacity-90 focus-visible:ring-2"
            onClick={() => setMobileNavOpen(false)}
          >
            <Image
              src="/logo/PartHive_PNG_Blue.png"
              alt="Part Hive"
              width={320}
              height={96}
              className="h-9 w-auto max-w-full object-contain object-left dark:hidden sm:h-10 lg:h-11"
              sizes="(max-width: 1023px) 75vw, 224px"
              priority
            />
            <Image
              src="/logo/PartHive_Blue_Logo_white.png"
              alt="Part Hive"
              width={320}
              height={96}
              className="hidden h-9 w-auto max-w-full object-contain object-left dark:block sm:h-10 lg:h-11"
              sizes="(max-width: 1023px) 75vw, 224px"
              priority
            />
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 lg:hidden"
            aria-label="Close sidebar"
            onClick={() => setMobileNavOpen(false)}
          >
            <X className="size-5" />
          </Button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Main">
          <Link
            href={EBAY_DESCRIPTOR_HREF}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              ebayDescriptorActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/90 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
            )}
            onClick={() => setMobileNavOpen(false)}
          >
            <LayoutGrid className="size-4 shrink-0 opacity-80" aria-hidden />
            <span className="truncate">eBay Descriptor</span>
          </Link>

          <div className="rounded-lg">
            <button
              type="button"
              id="sidebar-shopify-toggle"
              aria-expanded={shopifyNavOpen}
              aria-controls="sidebar-shopify-subnav"
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors outline-none ring-sidebar-ring focus-visible:ring-2",
                shopifySectionActive
                  ? "bg-sidebar-accent/30 text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/90 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
              )}
              onClick={() => setShopifyNavOpen((o) => !o)}
            >
              <ShoppingBag className="size-4 shrink-0 opacity-80" aria-hidden />
              <span className="min-w-0 flex-1 truncate">Shopify Products</span>
              <ChevronRight
                className={cn(
                  "size-4 shrink-0 opacity-80 transition-transform duration-200 ease-out",
                  shopifyNavOpen && "rotate-90",
                )}
                aria-hidden
              />
            </button>
            <div
              id="sidebar-shopify-subnav"
              role="region"
              aria-labelledby="sidebar-shopify-toggle"
              className={cn(
                "grid transition-[grid-template-rows] duration-200 ease-out",
                shopifyNavOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="ml-2 mt-0.5 flex flex-col gap-0.5 border-l-2 border-sidebar-border/70 py-1 pl-3">
                  <Link
                    href={SHOPIFY_PRODUCTS_HREF}
                    className={cn(
                      "flex items-center rounded-md py-2 pr-2 pl-2 text-sm font-medium transition-colors",
                      shopifyOverviewActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/90 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
                    )}
                    onClick={() => setMobileNavOpen(false)}
                  >
                    Overview
                  </Link>
                  <Link
                    href={NMAX125_HREF}
                    className={cn(
                      "flex items-center rounded-md py-2 pr-2 pl-2 text-sm font-medium transition-colors",
                      nmax125Active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/90 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
                    )}
                    onClick={() => setMobileNavOpen(false)}
                  >
                    NMAX 125
                  </Link>
                  <Link
                    href={PCX125_HREF}
                    className={cn(
                      "flex items-center rounded-md py-2 pr-2 pl-2 text-sm font-medium transition-colors",
                      pcx125Active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/90 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
                    )}
                    onClick={() => setMobileNavOpen(false)}
                  >
                    PCX 125
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="mt-auto space-y-3 border-t border-sidebar-border p-3">
          <div className="flex flex-wrap items-center gap-2">
            <SignOutButton />
            <ThemeToggle />
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border/80 bg-background/90 px-3 backdrop-blur-md supports-[backdrop-filter]:bg-background/75 sm:px-4 lg:px-5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 lg:hidden"
            aria-label="Open menu"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="size-5" />
          </Button>

          <div
            className="flex min-w-0 flex-1 items-center gap-2 text-sm sm:text-base"
            aria-label="Current section and page"
          >
            <span className="shrink-0 font-semibold tracking-tight text-foreground">
              {topSection}
            </span>
            <Separator
              orientation="vertical"
              className="h-5 shrink-0 bg-border"
            />
            <span className="min-w-0 truncate text-muted-foreground">
              {topPage}
            </span>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1 lg:hidden">
            <ThemeToggle />
          </div>
        </header>

        <div className="flex min-h-0 min-h-[calc(100dvh-3.5rem)] flex-1 flex-col lg:min-h-[calc(100dvh-1px)]">
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
          <DashboardPageFooter className="shrink-0 px-4 pb-4 sm:px-6" />
        </div>
      </div>
    </div>
  );
}
