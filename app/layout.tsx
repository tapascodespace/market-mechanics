import type { Metadata } from "next";
import { Libre_Baskerville } from "next/font/google";
import "./globals.css";

const baskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-baskerville",
});

export const metadata: Metadata = {
  title: "Reeshaw - Linear Prediction Markets",
  description: "Trade the actual number, not just direction. Linear payoffs for prediction markets.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={baskerville.variable}>
      <body style={{ fontFamily: "var(--font-baskerville), 'Baskerville', 'Georgia', serif" }}>
        {children}
      </body>
    </html>
  );
}
