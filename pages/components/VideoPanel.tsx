import React, { CSSProperties, useState } from "react";
import { VideoPlayer } from "./VideoPlayer";
import { IRemoteVideoTrack, ICameraVideoTrack } from "agora-rtc-sdk-ng";

type VideoPanelProps = {
  myVideo: ICameraVideoTrack | null | undefined;
  themVideo: IRemoteVideoTrack | null | undefined;
};

export const VideoPanel = ({ myVideo, themVideo }: VideoPanelProps) => {
  const [videoEnabled, setVideoEnabled] = useState(true);

  const toggleAudio = () => {
    if (myVideo) {
      try {
        myVideo.getMediaStreamTrack().enabled = videoEnabled;
        myVideo.off
        setVideoEnabled(!videoEnabled);
      } catch (error) {
        console.error("Error toggling audio:", error);
      }
    }
  };

  const mainPanelStyle: CSSProperties = {
    position: "relative",
    width: "100%",
    height: "100%",
    backgroundColor: "#1c1c1c",
    borderRadius: "10px",
    overflow: "hidden",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const videoPlayerStyle: CSSProperties = {
    width: "80vw",
    height: "80vh",
    maxWidth: "1000px",
    maxHeight: "700px",
    objectFit: "contain",
    borderRadius: "10px",
  };

  const floatingVideoStyle: CSSProperties = {
    position: "absolute",
    bottom: "20px",
    right: "20px",
    width: "180px",
    height: "120px",
    border: "2px solid #ffffff",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.3)",
  };

  
  const buttonStyle: CSSProperties = {
    padding: "8px 12px",
    margin: "5px",
    backgroundColor: "#4a4a4a",
    color: "#ffffff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  };

  return (
    <>
        {console.log(`Getting-> ${themVideo?.getStats()}`)}
    <div
      className="video-panel"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        padding: "20px",
        width: "100%",
        height: "100%",
      }}
    >
      
      <div className="main-video-stream" style={mainPanelStyle}>
        {themVideo ? (
          <VideoPlayer style={videoPlayerStyle} videoTrack={themVideo} />
        ) : (
          <div style={{ color: "#ffffff" }}>Connecting...</div>
        )}

        {/* Picture-in-picture (PIP) window for myVideo */}
        {myVideo && (
          <div className="floating-video-stream" style={floatingVideoStyle}>
            {
            
            }
            <VideoPlayer
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              videoTrack={myVideo}
            />
          </div>
        )}


        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "10px",
            display: "flex",
            gap: "10px",
          }}
        >
          <button style={buttonStyle} onClick={toggleAudio}>
            {videoEnabled ? "Turn off video" : "Turn on Audio"}
          </button>
        </div>
      </div>
      </div>
      </>
      );
    
};
