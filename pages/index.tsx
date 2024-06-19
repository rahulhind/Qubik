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