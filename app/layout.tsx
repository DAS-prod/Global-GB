import type { Metadata } from "next";
import "./globals.css";
import { CatalogProvider } from "@/components/CatalogProvider";
import { BoxProvider } from "@/components/BoxProvider";
import Header from "@/components/Header";
import BoxDrawer from "@/components/BoxDrawer";
import FloatingBox from "@/components/FloatingBox";
import WhatsAppButton from "@/components/WhatsAppButton";
import MotionInit from "@/components/MotionInit";
import IntroAnimation from "@/components/IntroAnimation";
import Toast from "@/components/Toast";

export const metadata: Metadata = {
  title: "Godavari Basket Abroad | From Godavari, With Love",
  description: "Build a premium Godavari box with authentic regional favourites and send a little piece of home across the world.",
  metadataBase: new URL("https://abroad.godavaribasket.com"),
  openGraph: { title: "Godavari Basket Abroad", description: "From Godavari, With Love. Build your Godavari box for delivery abroad.", type: "website", images: ["/images/abroad/og.webp"] }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><CatalogProvider><BoxProvider><IntroAnimation /><MotionInit /><Header />{children}<BoxDrawer /><FloatingBox /><WhatsAppButton /><Toast /></BoxProvider></CatalogProvider></body></html>;
}
