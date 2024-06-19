import {
  ICameraVideoTrack,
  IRemoteVideoTrack,
  IAgoraRTCClient,
  IRemoteAudioTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";

const logError = (error: Error, context: string) => {
  console.error(`Error in ${context}: ${error.message}`);
  // Add any additional logging or error reporting here (e.g., send to an error monitoring service)
};

export async function connectToAgoraRtc(
  roomId: string,
  userId: string,
  onVideoConnect: (track: IRemoteVideoTrack | null) => void,
  onWebcamStart: (track: ICameraVideoTrack) => void,
  onAudioConnect: (track: IRemoteAudioTrack | null) => void,
  token: string
): Promise<{ tracks: [IMicrophoneAudioTrack, ICameraVideoTrack]; client: IAgoraRTCClient }> {
  try {
    const { default: AgoraRTC } = await import("agora-rtc-sdk-ng");

    const client = AgoraRTC.createClient({
      mode: "rtc",
      codec: "vp8",
    });

    await client.join(
      process.env.NEXT_PUBLIC_AGORA_APP_ID!,
      roomId,
      token,
      userId
    );

    client.on("user-published", (themUser, mediaType) => {
      client.subscribe(themUser, mediaType).then(() => {
        try {
          if (mediaType === "video") {
            onVideoConnect(themUser.videoTrack || null);
          } else if (mediaType === "audio") {
            onAudioConnect(themUser.audioTrack || null);
            themUser.audioTrack?.play();
          }
        } catch (error) {
          logError(error as Error, "client.subscribe callback");
        }
      }).catch(error => {
        logError(error as Error, "client.subscribe");
      });
    });

    const tracks = await AgoraRTC.createMicrophoneAndCameraTracks();

    onWebcamStart(tracks[1]);
    await client.publish(tracks);

    return { tracks, client };
  } catch (error) {
    logError(error as Error, "connectToAgoraRtc");
    throw error; // rethrow the error after logging it
  }
}

export async function connectToAgoraRtm(
  roomId: string,
  userId: string,
  onMessage: (message: { userId: string; message?: string }) => void,
  token: string
): Promise<{ channel: any }> {
  try {
    const { default: AgoraRTM } = await import("agora-rtm-sdk");
    const client = AgoraRTM.createInstance(process.env.NEXT_PUBLIC_AGORA_APP_ID!);
    await client.login({
      uid: userId,
      token,
    });
    const channel = await client.createChannel(roomId);
    await channel.join();
    channel.on("ChannelMessage", (message, userId) => {
      try {
        onMessage({
          userId,
          message: message.text,
        });
      } catch (error) {
        logError(error as Error, "channel.on ChannelMessage callback");
      }
    });

    return {
      channel,
    };
  } catch (error) {
    logError(error as Error, "connectToAgoraRtm");
    throw error; // rethrow the error after logging it
  }
}
