import React from "react";
import { currentUser } from "@clerk/nextjs/server";
import ProfilePage from "./profile-view";

export async function generateMetadata() {
  const user = await currentUser();

  if (!user) {
    return {
      title: "CodeCraft IDE - Profil",
      description: "Kullanıcının CodeCraft IDE üzerindeki profili.",
      keywords:
        "CodeCraft IDE Profili, Yazılım Geliştiriciler, Kodlama Topluluğu",
      openGraph: {
        title: "CodeCraft IDE - Profil",
        description: "Kullanıcının profili.",
        type: "profile",
      },
      twitter: {
        card: "summary_large_image",
        title: "CodeCraft IDE - Profil",
        description: "Kullanıcının profili.",
      },
      robots: "index, follow",
      canonical: "https://codecraft-ide.com/profile/",
    };
  } else {
    return {
      title: `CodeCraft IDE - ${user.fullName} | Profil`,
      description: `${user.fullName} kullanıcısının CodeCraft IDE üzerindeki profili.`,
      keywords: `${user.fullName}, CodeCraft IDE Profili, Yazılım Geliştiriciler, Kodlama Topluluğu`,
      openGraph: {
        title: `CodeCraft IDE - ${user.fullName} | Profil`,
        description: `${user.fullName} kullanıcısının profili.`,
        type: "profile",
      },
      twitter: {
        card: "summary_large_image",
        title: `CodeCraft IDE - ${user.fullName} | Profil`,
        description: `${user.fullName} kullanıcısının profili.`,
      },
      robots: "index, follow",
      canonical: `https://codecraft-ide.com/profile/${user.username}`,
    };
  }
}

const page = () => {
  // @ts-expect-error: TODO: Fix this
  return <ProfilePage />;
};

export default page;
