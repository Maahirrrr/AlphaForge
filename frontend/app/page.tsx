"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#08090B] font-mono text-xs text-[#8A94A6]">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#007AFF] animate-ping" />
        <span>INITIALIZING ALPHAFORGE WORKSTATION...</span>
      </div>
    </div>
  );
}
