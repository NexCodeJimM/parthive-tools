import { DashboardChrome } from "@/components/dashboard-chrome";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardChrome>{children}</DashboardChrome>;
}
