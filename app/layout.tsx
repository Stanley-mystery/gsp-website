import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RCCG The Good Shepherd's Pasture | Yaba, Lagos",
  description:
    "A loving, vibrant, multi-cultural RCCG parish in Yaba, Lagos. Join us for worship, prayer, Bible study, and community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
