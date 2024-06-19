import React, { useRef, useEffect } from "react";
import { ICameraVideoTrack, IRemoteVideoTrack } from "agora-rtc-sdk-ng";

const logError = (error: Error, context: string) => {
  console.error(`Error in ${context}: ${error.message}`);
  // Add any additional logging or error reporting here (e.g., send to an error monitoring service)
};

export const VideoPlayer = ({
  videoTrack,
  style,
}: {
  videoTrack: IRemoteVideoTrack | ICameraVideoTrack;
  style: object;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const playerRef = ref.current;
    if (!videoTrack || !playerRef) return;

    try {
      videoTrack.play(playerRef);
    } catch (error) {
      logError(error as Error, "videoTrack.play");
    }

    return () => {
      try {
        videoTrack.stop();
      } catch (error) {
        logError(error as Error, "videoTrack.stop");
      }
    };
  }, [videoTrack]);

  return <div ref={ref} style={style}></div>;
};
