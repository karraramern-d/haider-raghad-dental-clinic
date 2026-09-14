import type { Metadata } from "next";
import "./globals.css";
import "./hero-wide.css";

export const metadata: Metadata = {
  title: "عيادة الدكتور حيدر رغد | طب الأسنان",
  description: "رعاية هادئة ومتكاملة لصحة وجمال الأسنان في بغداد — الحرية.",
  icons: { icon: "/brand/logo-display.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
