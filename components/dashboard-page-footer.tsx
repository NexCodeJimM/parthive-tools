import { cn } from "@/lib/utils";

const DEFAULT_TAGLINE = "Part Hive · Internal tool";

type DashboardPageFooterProps = {
  /** Override the default Part Hive tagline (rare; prefer one shared footer). */
  tagline?: string;
  className?: string;
};

export function DashboardPageFooter({
  tagline = DEFAULT_TAGLINE,
  className,
}: DashboardPageFooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer
      className={cn(
        "mt-4 border-t border-border/50 py-2.5 text-[11px] leading-tight text-muted-foreground",
        className,
      )}
    >
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-2.5 gap-y-1 sm:justify-center">
        <span className="whitespace-nowrap">{tagline}</span>
        <span
          className="hidden h-2.5 w-px shrink-0 bg-border/70 sm:block"
          aria-hidden
        />
        <span className="text-center sm:text-left">
          © {year} Jim Mendoza. All rights reserved.
        </span>
        <span
          className="hidden h-2.5 w-px shrink-0 bg-border/70 sm:block"
          aria-hidden
        />
        <span className="whitespace-nowrap">
          Developed by{" "}
          <a
            href="https://jimmendoza.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/85 underline-offset-2 transition-colors hover:text-primary hover:underline"
          >
            Jim Mendoza
          </a>
        </span>
      </div>
    </footer>
  );
}
