import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 flex-col">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-xs">
            Part Hive
          </span>
          <span className="truncate text-sm font-semibold tracking-tight sm:text-base">
            eBay listing tools
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <SignOutButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
