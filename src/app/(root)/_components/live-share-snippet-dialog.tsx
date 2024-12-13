import { Dispatch, SetStateAction, useState } from "react";
import { X } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useSocketStore } from "@/store/useSocketStore";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { motion } from "framer-motion";

type Participant = {
  email: string;
  canEdit: boolean;
  canRunCode: boolean;
};

type LiveShare = {
  liveShareCode: string;
  participants: Participant[];
};

type LiveShareSnippetDialogProps = {
  onClose: () => void;
  liveShare: LiveShare | null;
  setliveShare: Dispatch<SetStateAction<LiveShare | null>>;
};

function LiveShareSnippetDialog({
  onClose,
  liveShare,
  setliveShare,
}: LiveShareSnippetDialogProps) {
  const { socket, setRoomId } = useSocketStore();
  const { user } = useUser();
  const [newRoomId, setNewRoomId] = useState<string>("");
  const { setLivePermission } = useCodeEditorStore();

  const handleJoinRoom = (roomId: string, email: string) => {
    if (!socket) return;
    socket.emit("joinRoom", { roomId, email });
    setliveShare({ liveShareCode: roomId, participants: [] });
    setNewRoomId(roomId);
  };

  const handlePermissionChange = (
    email: string,
    permission: "canEdit" | "canRunCode",
    value: boolean
  ) => {
    if (!socket || !liveShare) return;

    const updatedParticipants = liveShare.participants.map((participant) =>
      participant.email === email
        ? { ...participant, [permission]: value }
        : participant
    );

    setliveShare({ ...liveShare, participants: updatedParticipants });

    socket.emit("updatePermissions", {
      roomId: liveShare.liveShareCode,
      email,
      canEdit: updatedParticipants.find((p) => p.email === email)?.canEdit,
      canRunCode: updatedParticipants.find((p) => p.email === email)
        ?.canRunCode,
    });
  };

  const handleExitRoom = () => {
    if (socket && liveShare) {
      socket.emit("leaveRoom", {
        roomId: liveShare.liveShareCode,
        email: user?.emailAddresses[0].emailAddress,
      });
      useSocketStore.setState({
        roomId: null,
      });
      setliveShare(null);
      setRoomId(null);
      setLivePermission(null);
      setNewRoomId("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1e1e2e] rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Live Share Start</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Room ID */}
        {liveShare ? (
          <>
            <p className="text-sm text-gray-300 mb-4">
              Room ID: {liveShare.liveShareCode}
            </p>

            {/* Participants */}
            <div className="space-y-4">
              {liveShare.participants.map((participant) => (
                <div
                  key={participant.email}
                  className="bg-gray-800 p-4 rounded-lg flex items-center justify-between"
                >
                  <div className="text-white">
                    <p className="font-semibold">{participant.email}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <span className="text-sm text-gray-300">Edit</span>
                      <motion.input
                        type="checkbox"
                        checked={participant.canEdit}
                        onChange={(e) =>
                          handlePermissionChange(
                            participant.email,
                            "canEdit",
                            e.target.checked
                          )
                        }
                        className="hidden"
                        id={`checkbox-${participant.email}`}
                      />
                      <motion.div
                        className="w-6 h-6 flex items-center justify-center border-2 border-gray-500 rounded cursor-pointer"
                        whileTap={{ scale: 0.9 }}
                      >
                        {participant.canEdit && (
                          <motion.div
                            className="w-3 h-3 bg-purple-500 rounded"
                            layout
                          />
                        )}
                      </motion.div>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            {/* Exit Room Button */}
            <button
              onClick={handleExitRoom}
              className="bg-red-500 text-white p-2 rounded w-full hover:bg-red-600 mt-4"
            >
              Exit Room
            </button>
          </>
        ) : (
          <>
            {/* Join Room Input */}
            <input
              type="text"
              value={newRoomId}
              onChange={(e) => setNewRoomId(e.target.value)}
              placeholder="Enter Room ID"
              className="w-full p-2 rounded bg-gray-700 text-white mb-2"
              id="joinRoomInput"
            />

            <div className="flex gap-2">
              <button
                onClick={() => {
                  handleJoinRoom(
                    crypto.randomUUID(),
                    user?.emailAddresses[0].emailAddress || ""
                  );
                }}
                className="bg-gradient-to-r
               from-purple-500 to-green-600 text-white p-2 rounded w-full hover:bg-blue-600"
              >
                Create Room
              </button>
              <button
                onClick={() => {
                  handleJoinRoom(
                    newRoomId,
                    user?.emailAddresses[0].emailAddress || ""
                  );
                }}
                className="bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600"
              >
                Join Room
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default LiveShareSnippetDialog;
