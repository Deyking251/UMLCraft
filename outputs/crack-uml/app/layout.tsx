import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crack UML — learn by modeling",
  description: "A guided UML modeling studio for students and small product teams."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
