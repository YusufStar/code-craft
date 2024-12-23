import { GoogleTagManager } from "@next/third-parties/google";
import localFont from "next/font/local";
import "./globals.css";
import ConvexProvider from "@/components/providers/convex-provider";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <GoogleTagManager gtmId="GTM-PJQMFL2R" />

      <link rel="icon" href="/logo.svg" sizes="any" />
      <title>
        CodeCraft IDE - Online Kodlama Platformu | AI Destekli Çözüm Ortağınız
      </title>
      <meta
        name="description"
        content="CodeCraft IDE, 10+ programlama dili desteğiyle online kodlama yapmanızı sağlayan, yapay zeka destekli, kullanıcı dostu bir platformdur. Kod yaz, analiz et, paylaş ve öğren!"
      ></meta>
      <meta
        name="keywords"
        content="CodeCraft IDE, Online IDE, Kodlama Platformu, Yapay Zeka Kodlama, Programlama Dilleri, Kod Paylaşımı, Kod Analizi"
      ></meta>
      <meta
        property="og:title"
        content="CodeCraft IDE - Online Kodlama Platformu"
      ></meta>
      <meta
        property="og:description"
        content="Yapay zeka destekli, kullanıcı dostu IDE'mizle kod yazmayı ve paylaşmayı kolaylaştırın. 10+ programlama dili desteğiyle şimdi deneyin!"
      ></meta>
      <meta
        property="og:image"
        content="https://codecraft-ide.com/og-image.png"
      ></meta>
      <meta property="og:url" content="https://codecraft-ide.com"></meta>
      <meta property="og:type" content="website"></meta>
      <meta name="twitter:card" content="summary_large_image"></meta>
      <meta
        name="twitter:title"
        content="CodeCraft IDE - Online Kodlama Platformu"
      ></meta>
      <meta
        name="twitter:description"
        content="Yapay zeka destekli, kullanıcı dostu IDE'mizle kod yazmayı ve paylaşmayı kolaylaştırın. 10+ programlama dili desteğiyle şimdi deneyin!"
      ></meta>
      <meta
        name="twitter:image"
        content="https://codecraft-ide.com/twitter-card.png"
      ></meta>
      <link rel="canonical" href="https://codecraft-ide.com"></link>
      <meta name="robots" content="index, follow"></meta>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100 flex flex-col`}
      >
        <ConvexProvider>{children}</ConvexProvider>

        <Footer />

        <Toaster theme="dark" position="bottom-left" />
      </body>
    </html>
  );
}
