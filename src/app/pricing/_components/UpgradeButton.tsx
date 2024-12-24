"use client";
import { useAction } from "convex/react";
import { Zap } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";

export default function UpgradeButton() {
  const upgrade = useAction(api.stripe.pay);
  const router = useRouter();

  const handleClick = async () => {
    const url = await upgrade();
    if (!url) {
      return;
    }
    router.push(url);
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex transition-all duration-200 ease-in-out items-center justify-center gap-2 px-8 py-4 text-white 
        bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg 
        hover:from-blue-600 hover:to-blue-700"
    >
      <Zap className="w-5 h-5" />
      Upgrade to Pro
    </button>
  );
}
