import { AnimatePresence } from "framer-motion";
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useLiveStore } from "@/store/useLiveStore";
import { toast } from "sonner";
import QRCode from "qrcode";
import Image from "next/image";

const InviteDialog = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const { room } = useLiveStore();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [qrCode, setQrCode] = React.useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const generate = () => {
    QRCode.toDataURL(
      `${process.env.NEXT_PUBLIC_HOSTING_URL!}?roomId=${room?.id}&roomPassword=${room?.password}`
    ).then(setQrCode);
  };

  useEffect(() => {
    setQrCode(null);
    if (open) {
      generate();
    }
  }, [open]);

  return (
    <AnimatePresence key={room?.id + "invite"}>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
          <div
            ref={dialogRef}
            className="ease-out transition-all sm:max-w-lg sm:w-full m-3 sm:mx-auto"
          >
            <div className="bg-background shadow-lg rounded-lg p-4">
              {/* copy room id to send user and user go live tab and paste room id and join button. please this guide write */}
              <h2 className="text-lg font-bold text-white">
                Invite User to Room
              </h2>
              <p className="text-xs text-white/70">
                Copy room id to send user and user go live tab and paste room id
                and join button. please this guide write
              </p>
              <div className="flex items-center justify-between mt-4">
                <h2 className="font-bold text-white">Room ID</h2>
                <h2 className="text-xs font-semibold text-white/70">
                  {room?.id}
                </h2>
              </div>
              <div
                className="
                flex items-center justify-center mt-4"
              >
                {qrCode ? (
                  <Image src={qrCode} alt="QR Code" width={200} height={200} />
                ) : (
                  // skeleton loader
                  <div className="bg-background w-[200px] h-[200px] animate-pulse bg-gray-800 rounded-md"></div>
                )}
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 bg-red-600 duration-200 ease-in-out text-white font-semibold rounded-md text-xs shadow hover:bg-red-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(room?.id || "");
                    toast.success("Room ID copied to clipboard", {
                      description: room?.id,
                    });
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-green-600 duration-200 ease-in-out text-white font-semibold rounded-md text-xs shadow hover:bg-green-700 transition ml-2"
                >
                  Invite
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InviteDialog;
