import { Metadata } from "next";
import EditorPanel from "./_components/editor-panel";
import Header from "./_components/header";
import MiniRoomBlock from "./_components/MiniRoomBlock";
import OutputPanel from "./_components/output-panel";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "CodeCraft IDE - Ortak Kodlama ve Canlı Kod Çalıştırma",
  description:
    "CodeCraft IDE ile kullanıcılar, birden fazla kişiyle aynı odada ortak kodlama yapabilir, canlı olarak kodlarını yazabilir ve çalıştırabilir. Yenilikçi ve AI destekli modern bir kodlama platformu.",
  keywords:
    "CodeCraft IDE, Ortak Kodlama, Canlı Kodlama, Online Kod Editörü, Kodlama Platformu, Yapay Zeka Kodlama, Programlama",
  openGraph: {
    title: "CodeCraft IDE - Ortak Kodlama ve Canlı Kod Çalıştırma",
    description:
      "Yenilikçi AI destekli CodeCraft IDE ile birden fazla kişiyle ortak kodlama yapın. Kod yazmayı, paylaşmayı ve çalıştırmayı kolaylaştıran modern bir platform.",
    url: "https://codecraft-ide.com/editor",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeCraft IDE - Ortak Kodlama ve Canlı Kod Çalıştırma",
    description:
      "AI destekli CodeCraft IDE ile kodlarınızı yazın, paylaşın ve canlı çalıştırın. Birden fazla kişiyle aynı odada ortak kodlama yapabilirsiniz!",
  },
  robots: "index, follow",
};

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="max-w-[1800px] mx-auto p-4">
        <Header />
      </div>

      <div className="relative max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 auto-rows-[1fr]">
        <MiniRoomBlock />
        <div className="h-full">
          <Suspense fallback={<div>Loading...</div>}>
            <EditorPanel />
          </Suspense>
        </div>

        <div className="h-full">
          <Suspense fallback={<div>Loading...</div>}>
            <OutputPanel />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
