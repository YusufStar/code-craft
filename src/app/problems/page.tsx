import React from "react";
import ProblemsPage from "./problems-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CodeCraft IDE - Kodlama Problemleri ve Çözümleri | Zorlukları Keşfet",
  description:
    "CodeCraft IDE'de çeşitli zorluk seviyelerinde kodlama problemlerini çözerek kendinizi geliştirin. Çözümlerinizi paylaşın, diğer kullanıcıların çözümlerini inceleyin ve kodlama becerilerinizi artırın.",
  keywords:
    "Kodlama Problemleri, Programlama Zorlukları, Coding Challenges, CodeCraft IDE, Algoritma Soruları, Online Kodlama, Kodlama Çözümleri",
  openGraph: {
    title:
      "CodeCraft IDE - Kodlama Problemleri ve Çözümleri | Zorlukları Keşfet",
    description:
      "CodeCraft IDE ile farklı seviyelerde kodlama problemlerini çözerek kodlama becerilerinizi geliştirin. Çözümlerinizi paylaşın ve toplulukla etkileşimde bulunun.",
    url: "https://codecraft-ide.com/challenges",

    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "CodeCraft IDE - Kodlama Problemleri ve Çözümleri | Zorlukları Keşfet",
    description:
      "Kodlama problemlerini çözerek öğrenin ve büyüyün! CodeCraft IDE'de algoritma sorularını deneyin ve çözümler oluşturun.",
  },
  robots: "index, follow",
};

const page = () => <ProblemsPage />;

export default page;
