import Header from "./_components/header";
import OutputPanel from "./_components/output-panel";
import EditorPanel from "./_components/editor-panel";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title:
    "CodeCraft IDE - Online React Editörü | Canlı Kod Önizleme ve Anlık Build",
  description:
    "React projelerinizi online olarak geliştirin ve anında sonuçlar alın. Canlı kod önizleme, anlık build ve hatasız bir geliştirme deneyimi sunan CodeCraft IDE'nin React editörünü keşfedin.",
  keywords:
    "React Editör, Online React IDE, Canlı Kod Önizleme, React Online Geliştirme, Anlık Build, React Proje Geliştirme, CodeCraft IDE",
  openGraph: {
    title: "CodeCraft IDE - Online React Editörü",
    description:
      "React projelerinizi online olarak geliştirin ve sonuçları anında görün. Canlı kod önizleme ve anlık build özellikleriyle hatasız bir geliştirme deneyimi sunuyoruz.",
    url: "https://codecraft-ide.com/react-editor",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeCraft IDE - Online React Editörü",
    description:
      "Canlı kod önizleme ve anlık build özellikleriyle React projelerinizi online olarak geliştirin. CodeCraft IDE ile geliştirme deneyiminizi bir üst seviyeye taşıyın!",
  },
  robots: "index, follow",
};

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="max-w-[1800px] mx-auto p-4">
        <Header />
      </div>

      <div className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 auto-rows-[1fr]">
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
