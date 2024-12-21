"use client";
import React, { useState } from "react";
import { useLiveStore } from "@/store/useLiveStore";
import { AnimatePresence, motion } from "framer-motion";
import { useTabsStore } from "@/store/useTabsStore";
import { Tv } from "lucide-react";
import { Avatar } from "@mui/material";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import InviteDialog from "./InviteDialog";

const MiniRoomBlock = () => {
  const { room } = useLiveStore();
  const { currentTab } = useTabsStore();
  const usersData = useQuery(api.users.getUsers);
  const [open, setOpen] = useState(false);

  const onClose = () => {
    setOpen(false);
  };

  return (
    <AnimatePresence key={room?.id + "mini"}>
      <InviteDialog open={open} onClose={onClose} />
      {room && currentTab !== "live" && (
        <motion.div
          key={room?.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.5, y: 0 }}
          whileHover={{ opacity: 1 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-0 opacity-50 right-0 z-10 p-4 bg-[#12121a] border-t-2 border-l border-[#7a7a7a]/20 rounded-tl-lg shadow-lg"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 border border-[#7a7a7a]/20 bg-background rounded-lg flex items-center justify-center">
              <Tv className="w-5 h-5 text-gray-200" />
            </div>
            <div className="ml-2">
              <h2 className="font-bold text-white">Live Session</h2>
              <h2 className="text-xs font-semibold text-white/70">
                {room?.id}
              </h2>
            </div>

            <button
              onClick={() => setOpen(true)}
              className="px-3 py-1.5 bg-green-600 duration-200 ease-in-out text-white font-semibold rounded-md text-xs shadow hover:bg-green-700 transition ml-4"
            >
              Invite User
            </button>
          </div>

          <div className="flex flex-wrap items-center mt-2">
            {room?.permissions &&
              Object.entries(room?.permissions).map(([userId]) => {
                const userRespone = usersData?.find(
                  (u: any) => u._id === userId
                );

                if (!userRespone) return null;

                return (
                  <div
                    key={userRespone._id}
                    className="flex items-center justify-between bg-[#2a2a40]/20 p-3 rounded-lg"
                  >
                    <Avatar
                      src={userRespone.name}
                      alt={userRespone.name}
                      sx={{
                        border: "2px solid green",
                      }}
                    />
                  </div>
                );
              })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MiniRoomBlock;
