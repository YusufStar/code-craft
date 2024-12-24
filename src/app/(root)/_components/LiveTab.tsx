import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CreateSessionDialog from "./CreateSessionDialog";
import JoinSessionDialog from "./JoinSessionDialog";
import { useLiveStore } from "@/store/useLiveStore";
import { Avatar } from "@mui/material";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import useSocketStore from "@/store/useSocketStore";
import InviteDialog from "./InviteDialog";

const LiveTab = () => {
  const { room, setRoom } = useLiveStore();
  const { socket } = useSocketStore();
  const [createSession, setCreateSession] = useState(false);
  const [joinSession, setJoinSession] = useState(false);
  const [open, setOpen] = useState(false);

  const { user } = useUser();

  const userData = useQuery(api.users.getUser, { userId: user?.id ?? "" });
  const usersData = useQuery(api.users.getUsers);
  const { updatePermissions } = useSocketStore();

  const handleCreateSession = () => {
    setCreateSession(true);
  };

  const handleJoinSession = () => {
    setJoinSession(true);
  };

  const handleJoinClose = () => {
    setJoinSession(false);
  };

  const handleCreateClose = () => {
    setCreateSession(false);
  };

  const handleLeaveSession = async () => {
    if (room && userData && user && socket) {
      socket.emit("leave-room", {
        userId: userData._id,
        roomId: room.id,
      });
      setRoom(null);
    }
  };

  const handleChangePermissions = async (userId: string, permissions: any) => {
    //@ts-expect-error: TODO: Fix this
    if (room && room.permissions[userData?._id].lead) {
      updatePermissions(room.id, userData?._id as string, userId, permissions);
    } else {
      console.error("You are not allowed to change permissions");
    }
  };

  const onClose = () => {
    setOpen(false);
  };

  return (
    <>
      <CreateSessionDialog
        userData={userData}
        isOpen={createSession}
        onClose={handleCreateClose}
      />
      <JoinSessionDialog
        userData={userData}
        isOpen={joinSession}
        onClose={handleJoinClose}
      />

      <InviteDialog open={open} onClose={onClose} />

      <AnimatePresence mode="wait">
        <motion.div
          key="live"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className="relative flex flex-col max-h-[600px]"
        >
          <div
            className="relative bg-[#1e1e2e]/50 backdrop-blur-sm border border-[#313244] 
            rounded-xl p-4 h-[600px] overflow-auto font-mono text-sm"
          >
            {!room ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <button
                  onClick={handleCreateSession}
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
                >
                  Create Session
                </button>
                <button
                  onClick={handleJoinSession}
                  className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow hover:bg-gray-700 transition"
                >
                  Join Session
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center w-full justify-between">
                  <h2 className="text-lg font-bold text-white">
                    Session Users
                  </h2>

                  <h2 className="text-lg underline underline-offset-4 font-bold text-white/70">
                    {room?.id}
                  </h2>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleLeaveSession}
                      className="px-3 py-1.5 bg-red-600 duration-200 ease-in-out text-white font-semibold rounded-lg shadow hover:bg-red-700 transition"
                    >
                      Leave Session
                    </button>

                    <button
                      onClick={() => setOpen(true)}
                      className="px-3 py-1.5 bg-green-600 duration-200 ease-in-out text-white font-semibold rounded-md text-xs shadow hover:bg-green-700 transition"
                    >
                      Invite User
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {room?.permissions &&
                    Object.entries(room?.permissions).map(
                      ([userId, userPermissions]) => {
                        const userRespone = usersData?.find(
                          (u: any) => u._id === userId
                        );

                        if (!userRespone) return null;

                        return (
                          <div
                            key={userRespone._id}
                            className="flex items-center justify-between bg-[#2a2a40] p-3 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <Avatar
                                src={userRespone.name}
                                alt={userRespone.name}
                              />
                              <div>
                                <div className="flex flex-col gap-1">
                                  <p className="text-white font-medium">
                                    {userRespone.name}
                                  </p>
                                  <p className="text-gray-400 text-xs">
                                    {userRespone.email}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex space-x-3">
                              <button
                                onClick={() =>
                                  handleChangePermissions(userId, {
                                    ...userPermissions,
                                    canEdit: !userPermissions.canEdit,
                                  })
                                }
                                className={`px-2 py-1 rounded-lg ${
                                  userPermissions.canEdit
                                    ? "bg-green-600 text-white"
                                    : "bg-gray-600 text-gray-300"
                                }`}
                              >
                                Can Edit
                              </button>
                              <button
                                onClick={() =>
                                  handleChangePermissions(userId, {
                                    ...userPermissions,
                                    canPlay: !userPermissions.canPlay,
                                  })
                                }
                                className={`px-2 py-1 rounded-lg ${
                                  userPermissions.canPlay
                                    ? "bg-yellow-600 text-white"
                                    : "bg-gray-600 text-gray-300"
                                }`}
                              >
                                Can Play
                              </button>
                              <button
                                onClick={() =>
                                  handleChangePermissions(userId, {
                                    ...userPermissions,
                                    lead: !userPermissions.lead,
                                  })
                                }
                                className={`px-2 py-1 rounded-lg ${
                                  userPermissions.lead
                                    ? "bg-purple-600 text-white"
                                    : "bg-gray-600 text-gray-300"
                                }`}
                              >
                                Lead
                              </button>
                            </div>
                          </div>
                        );
                      }
                    )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default LiveTab;
