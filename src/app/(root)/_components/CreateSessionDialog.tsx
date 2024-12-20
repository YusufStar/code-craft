"use client";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import useSocketStore from "@/store/useSocketStore";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  userData: any;
};

const CreateSessionDialog = ({ isOpen, onClose, userData }: Props) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  const { user } = useUser();

  const [formState, setFormState] = React.useState<{
    name: string;
    isPrivate: boolean;
    password?: string;
  }>({
    name: "",
    isPrivate: false,
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const { createRoom } = useSocketStore();

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

    if (!userData || !user) return;
    if (formState.isPrivate && !formState.password) {
      alert("Please enter a password.");
      return;
    }

    if (!formState.name) {
      alert("Please enter a name.");
    }

    try {
      if (!userData) return;
      setLoading(true);

      console.log("userData: ", formState.password);

      createRoom({
        creatorId: userData?._id,
        name: formState.name,
        password: formState.password,
      });
    } catch (error) {
      console.log("session create error: ", error);
    } finally {
      setLoading(false);
    }

    onClose();
    setFormState({
      name: "",
      isPrivate: false,
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
                    Session Create
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
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 dark:text-neutral-300"
                    >
                      Name
                    </label>
                    <input
                      onChange={(e) => handleChange(e.target.value, "name")}
                      value={formState.name}
                      type="text"
                      id="name"
                      name="name"
                      className="mt-1 block w-full px-3 py-2 border border-gray-800 bg-background rounded-md shadow-sm sm:text-sm outline-none 
                      focus:border-blue-600 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200"
                    />
                  </motion.div>

                  <motion.div
                    className="flex items-center gap-1"
                    variants={itemVariants}
                  >
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        onChange={(e) =>
                          handleChange(e.target.checked, "isPrivate")
                        }
                        checked={formState.isPrivate}
                        id="isPrivate"
                        name="isPrivate"
                        type="checkbox"
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-gray-800 rounded-full peer dark:bg-background peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gray-600"></div>
                      <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                        Private
                      </span>
                    </label>
                  </motion.div>

                  <AnimatePresence mode="wait">
                    {formState.isPrivate && (
                      <motion.div
                        className="flex flex-col gap-1"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <label
                          htmlFor="password"
                          className="block text-sm font-medium text-gray-700 dark:text-neutral-300"
                        >
                          Password
                        </label>
                        <input
                          onChange={(e) => {
                            handleChange(e.target.value, "password");
                          }}
                          value={formState.password}
                          type="password"
                          id="password"
                          name="password"
                          className="mt-1 block w-full px-3 py-2 border border-gray-800 bg-background rounded-md shadow-sm sm:text-sm outline-none 
                          focus:border-blue-600 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div
                    className="flex justify-end space-x-4"
                    variants={itemVariants}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setFormState({
                          name: "",
                          isPrivate: false,
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
                      {loading ? "Creating..." : "Create"}
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

export default CreateSessionDialog;
