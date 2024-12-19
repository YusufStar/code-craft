// permission-actions.ts

import axios from "axios";

// Define types for the permissions and the API response
interface Permissions {
  canEdit: boolean;
  canPlay: boolean;
  isLead: boolean;
}

interface PermissionsResponse {
  permissions: Permissions;
}

// Helper function to fetch user permissions from the API
export const fetchUserPermissions = async (
  roomId: string,
  userId: string
): Promise<Permissions> => {
  try {
    const response = await fetch(
      `http://localhost:3001/permissions/${roomId}/${userId}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch permissions");
    }
    const data: PermissionsResponse = await response.json();
    return data.permissions;
  } catch (error) {
    console.error(error);
    throw new Error("Error fetching user permissions");
  }
};

// Helper function to update user permissions in the API
interface UpdatePermissions {
  canEdit?: boolean;
  canPlay?: boolean;
  isLead?: boolean;
}

export const updateUserPermissions = async (
  roomId: string,
  userId: string,
  newPermissions: UpdatePermissions
): Promise<string> => {
  try {
    const { data } = await axios.put(
      `http://localhost:3001/permissions/${roomId}/${userId}`,
      newPermissions
    );
    return data;
  } catch (error: any) {
    if (error.response) {
      console.error("Response error:", error.response.data);
    } else {
      console.error("Error message:", error.message);
    }
    throw new Error("Error updating user permissions");
  }
};
