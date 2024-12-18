import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar } from "@mui/material";

// Types
interface User {
  id: number;
  firstName: string;
  lastName: string;
  avatar: string;
  canEdit: boolean;
  canPlay: boolean;
  isLead: boolean;
}

const LiveTab = () => {
  const [isInSession, setIsInSession] = useState(false);
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      avatar: "https://i.pravatar.cc/150?u=1",
      canEdit: true,
      canPlay: false,
      isLead: true,
    },
    {
      id: 2,
      firstName: "Jane",
      lastName: "Smith",
      avatar: "https://i.pravatar.cc/150?u=2",
      canEdit: false,
      canPlay: true,
      isLead: false,
    },
  ]);

  const togglePermission = (id: number, permission: keyof User) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === id
          ? { ...user, [permission]: !user[permission] }
          : user
      )
    );
  };

  const handleCreateSession = () => {
    setIsInSession(true);
  };

  const handleJoinSession = () => {
    setIsInSession(true);
  };

  return (
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
          {!isInSession ? (
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
              <h2 className="text-lg font-bold text-white">Session Users</h2>
              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between bg-[#2a2a40] p-3 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                      <div>
                        <p className="text-white font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        className={`px-2 py-1 rounded-lg ${
                          user.canEdit
                            ? "bg-green-600 text-white"
                            : "bg-gray-600 text-gray-300"
                        }`}
                        onClick={() => togglePermission(user.id, "canEdit")}
                      >
                        Can Edit
                      </button>
                      <button
                        className={`px-2 py-1 rounded-lg ${
                          user.canPlay
                            ? "bg-yellow-600 text-white"
                            : "bg-gray-600 text-gray-300"
                        }`}
                        onClick={() => togglePermission(user.id, "canPlay")}
                      >
                        Can Play
                      </button>
                      <button
                        className={`px-2 py-1 rounded-lg ${
                          user.isLead
                            ? "bg-purple-600 text-white"
                            : "bg-gray-600 text-gray-300"
                        }`}
                        onClick={() => togglePermission(user.id, "isLead")}
                      >
                        Lead
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LiveTab;
