"use client";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Id } from "../../../../convex/_generated/dataModel";
import { useLiveStore } from "@/store/useLiveStore";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  userData: any;
};

const JoinSessionDialog = ({ isOpen, onClose, userData }: Props) => {
  const { setRoom } = useLiveStore();
  const dialogRef = useRef<HTMLDivElement>(null);

  const { user } = useUser();

  const [formState, setFormState] = React.useState<{
    roomCode: string;
    password: string;
  }>({
    roomCode: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const joinRoom = useMutation(api.room.joinRoom);

  // Click outside to close
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

  const handleChange = (val: string | boolean, key: string) => {
    setFormState((prev) => ({ ...prev, [key]: val }));
  };

  const handleCreateSession = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user || !userData) {
      alert("Please login to join a session.");
      return;
    }

    if (!formState.roomCode) {
      alert("Please enter a room code.");
      return;
    }

    try {
      setLoading(true);
      const roomData = await joinRoom({
        roomCode: formState.roomCode,
        password: formState.password,
        userId: userData?._id as Id<"users">,
      });

      if (!roomData) {
        alert("Invalid room code or password.");
        return;
      }

      //@ts-expect-error: TODO: Fix this
      setRoom(roomData);
    } catch (error) {
      console.log("session create error: ", error);
    } finally {
      setLoading(false);
    }

    onClose();
    setFormState({
      roomCode: "",
      password: "",
    });
  };

  // Motion variants for staggered animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Delay between children animations
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
          <div
            ref={dialogRef}
            className="ease-out transition-all sm:max-w-lg sm:w-full m-3 sm:mx-auto"
          >
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
              <div className="p-4 sm:p-7">
                <div className="text-center">
                  <h3 className="block text-2xl text-start font-bold text-gray-800 dark:text-neutral-200">
                    Session Join
                  </h3>
                </div>

                <motion.form
                  onSubmit={handleCreateSession}
                  className="mt-4 space-y-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div
                    className="flex flex-col gap-1"
                    variants={itemVariants}
                  >
                    <label
                      htmlFor="roomCode"
                      className="block text-sm font-medium text-gray-700 dark:text-neutral-300"
                    >
                      Room Code
                    </label>
                    <input
                      onChange={(e) => handleChange(e.target.value, "roomCode")}
                      value={formState.roomCode}
                      type="text"
                      id="roomCode"
                      name="roomCode"
                      className="mt-1 block w-full px-3 py-2 border border-gray-800 bg-background rounded-md shadow-sm sm:text-sm outline-none 
                      focus:border-blue-600 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200"
                    />
                  </motion.div>

                  <motion.div
                    className="flex flex-col gap-1"
                    variants={itemVariants}
                  >
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 dark:text-neutral-300"
                    >
                      Password
                    </label>
                    <input
                      onChange={(e) => handleChange(e.target.value, "password")}
                      value={formState.password}
                      type="password"
                      id="password"
                      name="password"
                      className="mt-1 block w-full px-3 py-2 border border-gray-800 bg-background rounded-md shadow-sm sm:text-sm outline-none 
                          focus:border-blue-600 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200"
                    />
                  </motion.div>

                  <motion.div
                    className="flex justify-end space-x-4"
                    variants={itemVariants}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setFormState({
                          roomCode: "",
                          password: "",
                        });
                        onClose();
                      }}
                      className="px-6 py-2 text-sm bg-background text-white font-semibold rounded-lg shadow hover:bg-black transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 disabled:opacity-50 text-sm bg-blue-900 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
                    >
                      {loading ? "Creating..." : "Join"}
                    </button>
                  </motion.div>
                </motion.form>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default JoinSessionDialog;