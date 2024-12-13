"use client";

import { initializeSocket, useSocketStore } from "@/store/useSocketStore";
import { ReactNode, useEffect } from "react";

const SocketProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    // Socket'i başlatıyoruz
    initializeSocket();

    // Temizleme fonksiyonu, sayfa kapandığında socket bağlantısını kesmek için
    return () => {
      const socket = useSocketStore.getState().socket;
      socket?.disconnect();
    };
  }, []);

  return <>{children}</>;
};

export default SocketProvider;
