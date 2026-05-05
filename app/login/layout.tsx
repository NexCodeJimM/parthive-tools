import type { Metadata } from "next";

import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute right-3 top-3 z-10 sm:right-4 sm:top-4">
        <div className="pointer-events-auto">
          <ThemeToggle />
        </div>
      </div>
      {children}
    </div>
  );
}
