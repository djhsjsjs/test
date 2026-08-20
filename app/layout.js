import "./globals.css";
import { Inter, DM_Serif_Display } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const serif = DM_Serif_Display({ subsets: ["latin"], weight: "400", variable: "--font-serif" });

export const metadata = {
  title: "DEALCHECK — Know before you buy",
  description: "AI-powered product price, value and risk analysis with live market research."
};

export default function RootLayout({ children }) {
  return <html lang="en"><body className={`${inter.variable} ${serif.variable}`}>{children}</body></html>;
}
