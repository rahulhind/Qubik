
type TCreateRoomResponse = {
  room: Room;
  rtcToken: string;
  rtmToken: string;
};

type TGetRandomRoomResponse = {
  rooms: Room[]; // Ensure `Room` matches the defined schema
  rtcToken: string;
  rtmToken: string;
};
type Room = {
  _id: string;
  status: "waiting" | "chatting" | "inactive";
  users: string[];
  size?: number; // Optional virtual field
};
export function createRoom(userId: string): Promise<TCreateRoomResponse> {
  return fetch(`/api/rooms?userId=${userId}`, {
    method: "POST",
  }).then((response) => response.json());
}

export async function getRandomRoom(userId: string): Promise<TGetRandomRoomResponse | null> {
  try {
    console.log("Get random")
    const response = await fetch(`/api/rooms?userId=${userId}`);
    
    if (!response.ok) {
      console.error(`Error fetching rooms: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    console.log(`Get random 2 ${data.rooms}`)
    if (data && data.rooms && Array.isArray(data.rooms)) {
      return data;
    } else {
      console.error("Unexpected response structure:", data);
      return null;
    }
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return null;
  }
}


// export function setRoomToWaiting(roomId: string) {
//   console.log(`Room ID: ${roomId}`)
//   return fetch(`/api/rooms/${roomId}`, { method: "PUT" }).then((response) =>
//     response.json()
//   );
// }

// api.ts
export async function updateRoomStatus(roomId: string, status: string) {
  return fetch(`/api/rooms/${roomId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  }).then((response) => response.json());
}

export async function addUserToRoom(roomId: string, userId: string) {
  return fetch(`/api/rooms/${roomId}?userId=${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId }),
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`Failed to add user to room. Status: ${response.status}`);
    }
    return response.json();
  });
}

export async function removeUserFromRoom(roomId: string, userId: string) {
  console.log("call happening")
  return fetch(`/api/rooms/${roomId}?userId=${userId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId }),
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`Failed to remove user from room. Status: ${response.status}`);
    }
    return response.json();
  });
}

