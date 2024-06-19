// import Head from "next/head";
// import React, { useEffect, useRef, useState } from "react";
// import styles from "../styles/Home.module.css";
// import { RtmChannel } from "agora-rtm-sdk";
// import {
//   ICameraVideoTrack,
//   IRemoteVideoTrack,
//   IAgoraRTCClient,
//   IRemoteAudioTrack,
// } from "agora-rtc-sdk-ng";

// type TCreateRoomResponse = {
//   room: Room;
//   rtcToken: string;
//   rtmToken: string;
// };

// type TGetRandomRoomResponse = {
//   rtcToken: string;
//   rtmToken: string;
//   rooms: Room[];
// };

// type Room = {
//   _id: string;
//   status: string;
// };

// type TMessage = {
//   userId: string;
//   message: string | undefined;
// };

// function createRoom(userId: string): Promise<TCreateRoomResponse> {
//   return fetch(`/api/rooms?userId=${userId}`, {
//     method: "POST",
//   }).then((response) => response.json());
// }

// function getRandomRoom(userId: string): Promise<TGetRandomRoomResponse> {
//   return fetch(`/api/rooms?userId=${userId}`).then((response) =>
//     response.json()
//   );
// }

// function setRoomToWaiting(roomId: string) {
//   return fetch(`/api/rooms/${roomId}`, { method: "PUT" }).then((response) =>
//     response.json()
//   );
// }

// export const VideoPlayer = ({
//   videoTrack,
//   style,
// }: {
//   videoTrack: IRemoteVideoTrack | ICameraVideoTrack;
//   style: object;
// }) => {
//   const ref = useRef(null);

//   useEffect(() => {
//     const playerRef = ref.current;
//     if (!videoTrack) return;
//     if (!playerRef) return;

//     videoTrack.play(playerRef);

//     return () => {
//       videoTrack.stop();
//     };
//   }, [videoTrack]);

//   return <div ref={ref} style={style}></div>;
// };

// async function connectToAgoraRtc(
//   roomId: string,
//   userId: string,
//   onVideoConnect: any,
//   onWebcamStart: any,
//   onAudioConnect: any,
//   token: string
// ) {
//   const { default: AgoraRTC } = await import("agora-rtc-sdk-ng");

//   const client = AgoraRTC.createClient({
//     mode: "rtc",
//     codec: "vp8",
//   });

//   await client.join(
//     process.env.NEXT_PUBLIC_AGORA_APP_ID!,
//     roomId,
//     token,
//     userId
//   );

//   client.on("user-published", (themUser, mediaType) => {
//     client.subscribe(themUser, mediaType).then(() => {
//       if (mediaType === "video") {
//         onVideoConnect(themUser.videoTrack);
//       }
//       if (mediaType === "audio") {
//         onAudioConnect(themUser.audioTrack);
//         themUser.audioTrack?.play();
//       }
//     });
//   });

//   const tracks = await AgoraRTC.createMicrophoneAndCameraTracks();
//   onWebcamStart(tracks[1]);
//   await client.publish(tracks);

//   return { tracks, client };
// }

// async function connectToAgoraRtm(
//   roomId: string,
//   userId: string,
//   onMessage: (message: TMessage) => void,
//   token: string
// ) {
//   const { default: AgoraRTM } = await import("agora-rtm-sdk");
//   const client = AgoraRTM.createInstance(process.env.NEXT_PUBLIC_AGORA_APP_ID!);
//   await client.login({
//     uid: userId,
//     token,
//   });
//   const channel = await client.createChannel(roomId);
//   await channel.join();
//   channel.on("ChannelMessage", (message, userId) => {
//     onMessage({
//       userId,
//       message: message.text,
//     });
//   });

//   return {
//     channel,
//   };
// }

// export default function Home() {
//   const [userId] = useState(parseInt(`${Math.random() * 1e6}`) + "");
//   const [room, setRoom] = useState<Room | undefined>();
//   const [messages, setMessages] = useState<TMessage[]>([]);
//   const [input, setInput] = useState("");
//   const [themVideo, setThemVideo] = useState<IRemoteVideoTrack>();
//   const [myVideo, setMyVideo] = useState<ICameraVideoTrack>();
//   const [themAudio, setThemAudio] = useState<IRemoteAudioTrack>();
//   const channelRef = useRef<RtmChannel>();
//   const rtcClientRef = useRef<IAgoraRTCClient>();

//   function handleNextClick() {
//     connectToARoom();
//   }

//   function handleStartChattingClicked() {
//     connectToARoom();
//   }

//   async function handleSubmitMessage(e: React.FormEvent) {
//     e.preventDefault();
//     await channelRef.current?.sendMessage({
//       text: input,
//     });
//     setMessages((cur) => [
//       ...cur,
//       {
//         userId,
//         message: input,
//       },
//     ]);
//     setInput("");
//   }

//   async function connectToARoom() {
//     setThemAudio(undefined);
//     setThemVideo(undefined);
//     setMyVideo(undefined);
//     setMessages([]);

//     if (channelRef.current) {
//       await channelRef.current.leave();
//     }

//     if (rtcClientRef.current) {
//       rtcClientRef.current.leave();
//     }

//     const { rooms, rtcToken, rtmToken } = await getRandomRoom(userId);

//     if (room) {
//       setRoomToWaiting(room._id);
//     }

//     if (rooms.length > 0) {
//       setRoom(rooms[0]);
//       const { channel } = await connectToAgoraRtm(
//         rooms[0]._id,
//         userId,
//         (message: TMessage) => setMessages((cur) => [...cur, message]),
//         rtmToken
//       );
//       channelRef.current = channel;

//       const { tracks, client } = await connectToAgoraRtc(
//         rooms[0]._id,
//         userId,
//         (themVideo: IRemoteVideoTrack) => setThemVideo(themVideo),
//         (myVideo: ICameraVideoTrack) => setMyVideo(myVideo),
//         (themAudio: IRemoteAudioTrack) => setThemAudio(themAudio),
//         rtcToken
//       );
//       rtcClientRef.current = client;
//     } else {
//       const { room, rtcToken, rtmToken } = await createRoom(userId);
//       setRoom(room);
//       const { channel } = await connectToAgoraRtm(
//         room._id,
//         userId,
//         (message: TMessage) => setMessages((cur) => [...cur, message]),
//         rtmToken
//       );
//       channelRef.current = channel;

//       const { tracks, client } = await connectToAgoraRtc(
//         room._id,
//         userId,
//         (themVideo: IRemoteVideoTrack) => setThemVideo(themVideo),
//         (myVideo: ICameraVideoTrack) => setMyVideo(myVideo),
//         (themAudio: IRemoteAudioTrack) => setThemAudio(themAudio),
//         rtcToken
//       );
//       rtcClientRef.current = client;
//     }
//   }

//   function convertToYouThem(message: TMessage) {
//     return message.userId === userId ? "You" : "Them";
//   }

//   const isChatting = room!!;

//   return (
//     <>
//       <Head>
//         <title>Create Next App</title>
//         <meta name="description" content="Generated by create next app" />
//         <meta name="viewport" content="width=device-width, initial-scale=1" />
//         <link rel="icon" href="/favicon.ico" />
//       </Head>

//       <main className={styles.main}>
//         {isChatting ? (
//           <>
//             {room._id}
//             <button onClick={handleNextClick}>next</button>
//             <div className="chat-window">
//               <div className="video-panel">
//                 <div className="video-stream">
//                   {myVideo && (
//                     <VideoPlayer
//                       style={{ width: "100%", height: "100%" }}
//                       videoTrack={myVideo}
//                     />
//                   )}
//                 </div>
//                 <div className="video-stream">
//                   {themVideo && (
//                     <VideoPlayer
//                       style={{ width: "100%", height: "100%" }}
//                       videoTrack={themVideo}
//                     />
//                   )}
//                 </div>
//               </div>

//               <div className="chat-panel">
//                 <ul>
//                   {messages.map((message, idx) => (
//                     <li key={idx}>
//                       {convertToYouThem(message)} - {message.message}
//                     </li>
//                   ))}
//                 </ul>

//                 <form onSubmit={handleSubmitMessage}>
//                   <input
//                     value={input}
//                     onChange={(e) => setInput(e.target.value)}
//                   ></input>
//                   <button>submit</button>
//                 </form>
//               </div>
//             </div>
//           </>
//         ) : (
//           <>
//             <button onClick={handleStartChattingClicked}>Start Chatting</button>
//           </>
//         )}
//       </main>
//     </>
//   );
// }







import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import ChatRoom from "./components/GlobalChat"
import styles from "../styles/Home.module.css";
import { VideoPanel } from "./components/VideoPanel";
import { ChatPanel } from "./components/ChatPannel";
import AgoraRTC, {UID} from 'agora-rtc-sdk-ng';

import { createRoom, getRandomRoom , addUserToRoom, removeUserFromRoom, updateRoomStatus} from "./api/rooms/roomAPI";
import { connectToAgoraRtc, connectToAgoraRtm } from "./utils/agoraConnections";
import {
  ICameraVideoTrack,
  IRemoteVideoTrack,
  IAgoraRTCClient,
  IRemoteAudioTrack,
} from "agora-rtc-sdk-ng";
import { RtmChannel } from "agora-rtm-sdk";
// import { log } from "console";
// import axios from "axios";
type Room = {
  _id: string;
  status: "waiting" | "chatting" | "inactive"; 
  users: string[]; 
  size?: number; 
};
type TMessage = {
  userId: string;
  message?: string;
};

export default function Home() {
  const [userId] = useState(parseInt(`${Math.random() * 1e6}`, 10) + "");
  const [room, setRoom] = useState<Room | undefined>();
  const [messages, setMessages] = useState<TMessage[]>([]);
  const [themVideo, setThemVideo] = useState<IRemoteVideoTrack | null>(null);
  const [myVideo, setMyVideo] = useState<ICameraVideoTrack | null>(null);
  const [themAudio, setThemAudio] = useState<IRemoteAudioTrack | null>(null);
  const channelRef = useRef<RtmChannel>();
  const rtcClientRef = useRef<IAgoraRTCClient>();
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);

  // useEffect(() => {
  //   const handleVisibilityChange = () => {
  //     if (document.visibilityState === 'hidden') {
  //       alert('User has switched tabs');
  //     } else {
  //       alert('User is back to the tab');
  //     }
  //   };

  //   const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  //    event.preventDefault();
  //     event.returnValue = '';
      
  //     if (room) {
  //       try {
  //         // Call your custom functions here
  //          removeUserFromRoom(room._id, userId);
  //          updateRoomStatus(room._id, 'waiting');
  //       } catch (error) {
  //         console.error(`Error updating current room: ${error}`);
  //       }
  //     }
    
  // return 'Are you sure you want to leave?'; 
  //   };

  //   document.addEventListener('visibilitychange', handleVisibilityChange);
  //   window.addEventListener('beforeunload', handleBeforeUnload);

  //   return () => {
  //     document.removeEventListener('visibilitychange', handleVisibilityChange);
  //     window.removeEventListener('beforeunload', handleBeforeUnload);
  //   };
  // }, []);

  async function handleSubmitMessage(message: string) {
    await channelRef.current?.sendMessage({ text: message });
    setMessages((cur) => [
      ...cur,
      {
        userId,
        message,
      },
    ]);
  }

  async function connectToARoom() {
    setThemAudio(null);
    setThemVideo(null);
    setMyVideo(null);
    setMessages([]);

    if (channelRef.current) {
      await channelRef.current.leave();
    }

    if (rtcClientRef.current) {
      await rtcClientRef.current.leave();
    }

    if (room) {
      try {
        await removeUserFromRoom(room._id, userId);
      } catch (error) {
        console.error(`Error updating current room: ${error}`);
      }
    }

    const response = await getRandomRoom(userId);
    if (room) {
      try {
        await updateRoomStatus(room._id, 'waiting');
      } catch (error) {
        console.error(`Error updating current room: ${error}`);
      }
    }
    if (response && response.rooms && response.rooms.length > 0) {
      const firstRoom = response.rooms[0];
      setRoom(firstRoom);

      try {
        await addUserToRoom(firstRoom._id, userId);

        const { channel } = await connectToAgoraRtm(
          firstRoom._id,
          userId,
          (message: TMessage) => setMessages((cur) => [...cur, message]),
          response.rtmToken
        );
        channelRef.current = channel;

        const { tracks, client } = await connectToAgoraRtc(
          firstRoom._id,
          userId,
          (track: IRemoteVideoTrack | null) => setThemVideo(track),
          (track: ICameraVideoTrack) => setMyVideo(track),
          (track: IRemoteAudioTrack | null) => setThemAudio(track),
          response.rtcToken
        );
        rtcClientRef.current = client;
      } catch (error) {
        console.error(`Error connecting to the new room: ${error}`);
      }
    } else {
      try {
        const { room, rtcToken, rtmToken } = await createRoom(userId);
        setRoom(room);

        const { channel } = await connectToAgoraRtm(
          room._id,
          userId,
          (message: TMessage) => setMessages((cur) => [...cur, message]),
          rtmToken
        );
        channelRef.current = channel;

        const { tracks, client } = await connectToAgoraRtc(
          room._id,
          userId,
          (track: IRemoteVideoTrack | null) => setThemVideo(track),
          (track: ICameraVideoTrack) => setMyVideo(track),
          (track: IRemoteAudioTrack | null) => setThemAudio(track),
          rtcToken
        );
        rtcClientRef.current = client;
      } catch (error) {
        console.error(`Error creating or connecting to the new room: ${error}`);
      }
    }
  }

  const isChatting = room != null;

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          padding: "20px",
          backgroundColor: "#2c2c2c",
        }}
      >
        {isChatting ? (
          <>
            <div style={{ marginBottom: "10px" }}>
              <button onClick={connectToARoom}>Next</button>
            </div>
            <div
              className="chat-window"
              style={{
                display: "flex",
                flexDirection: "row",
                width: "100%",
                maxWidth: "1400px",
                gap: "10px",
                padding: "10px",
                backgroundColor: "#1a1a1a",
                borderRadius: "12px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                flexWrap: "wrap",
              }}
            >
              {/* Video Panel*/}
              <div style={{ flex: 3, padding: "10px", minWidth: "300px" }}>
                <VideoPanel myVideo={myVideo} themVideo={themVideo} />
              </div>

              {/* Chat Panel */}
              <div
                style={{
                  flex: 1,
                  minWidth: "300px",
                  maxWidth: "400px",
                  height: "600px",
                  padding: "10px",
                  borderRadius: "10px",
                  backgroundColor: "#3a3a3a",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                  overflowY: "auto",
                }}
              >
                <ChatPanel messages={messages} userId={userId} onMessageSend={handleSubmitMessage} />
              </div>
            </div>
          </>
        ) : (
          <div>
            <button onClick={connectToARoom}>Start Chatting</button>
          </div>
        )}
      </main>
    </>
  );
}