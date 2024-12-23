import React from "react";
import SnippetsPage from "./snippets-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CodeCraft IDE - Snippet Paylaşımı ve Yorumlar | Kodlama Topluluğu",
  description:
    "CodeCraft IDE kullanıcılarının snippetlerini keşfedin, kendi kodlarınızı paylaşın ve diğer geliştiricilerle yorum yaparak etkileşim kurun. Kodlama topluluğuna katılın!",
  keywords:
    "CodeCraft IDE, Kod Snippetleri, Snippet Paylaşımı, Kodlama Topluluğu, Yazılım Geliştiriciler, Kod Yorumlama, Kod Paylaşımı",
  openGraph: {
    title: "CodeCraft IDE - Snippet Paylaşımı ve Yorumlar",
    description:
      "Kullanıcıların paylaştığı kod snippetlerini keşfedin ve kendi kodlarınızı paylaşarak topluluğa katılın. Kodlama deneyiminizi geliştirin!",
    url: "https://codecraft-ide.com/snippets",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeCraft IDE - Snippet Paylaşımı ve Yorumlar",
    description:
      "Kodlama topluluğuna katılın ve kullanıcıların paylaştığı kod snippetlerini keşfedin. Kendi kodlarınızı paylaşarak etkileşim kurun!",
  },
  robots: "index, follow",
};

const page = () => <SnippetsPage />;

export default page;
