"use client";

import { useEffect, useRef, useState } from "react";
import { PeerManager, MediaManager } from "callway";
import { useIsCameraOff, useIsMicrophoneOff } from "callway/react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCallSocket } from "@/context/CallSocketContext";
import { SocketSignalingAdapter } from "@/lib/callway/SocketSignalingAdapter";
import type { CallMode } from "@/lib/api/calls";

type CallRoomProps = {
  callId: string;
  consultationId: string;
  mode: CallMode;
  localPeerId: string;
  remotePeerId: string;
  remoteName?: string;
  onEnd: () => void;
};

export function CallRoom({
  callId,
  consultationId,
  mode,
  localPeerId,
  remotePeerId,
  remoteName,
  onEnd,
}: CallRoomProps) {
  const { socket, isConnected } = useCallSocket();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState("Connecting…");
  const [error, setError] = useState<string | null>(null);
  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(mode === "audio");

  const isCamOffHook = useIsCameraOff(localStream);
  const isMicOffHook = useIsMicrophoneOff(localStream);

  useEffect(() => {
    if (!socket || !isConnected) return;

    let cancelled = false;
    let setupDone = false;

    const peerManager = new PeerManager(localPeerId);
    const mediaManager = new MediaManager();
    const adapter = new SocketSignalingAdapter(socket);

    const onPeerJoined = (payload: { peerId?: string; callId?: string }) => {
      if (payload.callId !== callId) return;
      if (payload.peerId !== remotePeerId) return;
      void (async () => {
        if (cancelled || setupDone) return;
        setupDone = true;
        try {
          setStatus("Peer joined — connecting…");
          peerManager.setSignalingAdapter(adapter, consultationId);
          await peerManager.addPeer(remotePeerId);
          mediaManager.attachToPeer(peerManager, remotePeerId);
          // Tracks trigger negotiationneeded; Callway perfect-negotiation
          // handles glare between both peers.
          setStatus("Negotiating…");
        } catch (err) {
          console.error(err);
          setError("Failed to start peer connection");
        }
      })();
    };

    const onPeerLeft = (payload: { peerId?: string; callId?: string }) => {
      if (payload.callId !== callId) return;
      if (payload.peerId === remotePeerId) {
        setStatus("Other party left");
      }
    };

    peerManager.onRemoteStream((stream) => {
      if (remoteVideoRef.current && mode === "video") {
        remoteVideoRef.current.srcObject = stream;
      }
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = stream;
      }
      setStatus("Connected");
    });
    peerManager.onConnectionStateChange((state) => {
      if (state === "connected") setStatus("Connected");
      if (state === "failed") setStatus("Connection failed");
      if (state === "disconnected") setStatus("Disconnected");
    });

    void (async () => {
      try {
        const stream = await mediaManager.getUserMedia({
          audio: true,
          video: mode === "video",
        });
        if (cancelled) {
          mediaManager.cleanup();
          return;
        }
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        if (mode === "audio") setCamOff(true);

        socket.on("peerJoined", onPeerJoined);
        socket.on("peerLeft", onPeerLeft);
        socket.emit(
          "joinCall",
          { callId, consultationId },
          (ack?: { ok?: boolean; error?: string }) => {
            if (ack && ack.ok === false) {
              setError(ack.error || "Could not join call");
            }
          },
        );
        setStatus("Waiting for the other party…");
      } catch (err) {
        console.error(err);
        setError("Could not access microphone/camera. Check permissions.");
      }
    })();

    return () => {
      cancelled = true;
      socket.off("peerJoined", onPeerJoined);
      socket.off("peerLeft", onPeerLeft);
      socket.emit("leaveCall", { callId });
      void peerManager.cleanup();
      mediaManager.cleanup();
      adapter.cleanup();
    };
  }, [
    socket,
    isConnected,
    callId,
    consultationId,
    localPeerId,
    remotePeerId,
    mode,
  ]);

  const toggleMic = () => {
    const track = localStream?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setMicMuted(!track.enabled);
  };

  const toggleCam = () => {
    if (mode === "audio") return;
    const track = localStream?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setCamOff(!track.enabled);
  };

  const micOff = micMuted || isMicOffHook;
  const cameraOff = camOff || isCamOffHook;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#0b1220] text-white">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-sm font-medium">
            {remoteName || "Consultation call"}
          </p>
          <p className="text-xs text-white/60">{status}</p>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs capitalize">
          {mode}
        </span>
      </div>

      {error ? (
        <div className="mx-4 rounded-lg bg-red-500/20 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {mode === "video" ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-white/80">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/10 text-3xl font-semibold">
              {(remoteName || "P").charAt(0).toUpperCase()}
            </div>
            <p className="text-sm">{status}</p>
            {!isConnected ? (
              <Loader2 className="h-5 w-5 animate-spin text-white/50" />
            ) : null}
          </div>
        )}

        <audio ref={remoteAudioRef} autoPlay playsInline />

        {mode === "video" ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="absolute bottom-4 right-4 h-32 w-24 rounded-lg border border-white/20 object-cover shadow-lg sm:h-40 sm:w-28"
          />
        ) : null}
      </div>

      <div className="flex items-center justify-center gap-3 px-4 py-6">
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="h-12 w-12 rounded-full"
          onClick={toggleMic}
          aria-label={micOff ? "Unmute" : "Mute"}
        >
          {micOff ? (
            <MicOff className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </Button>
        {mode === "video" ? (
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="h-12 w-12 rounded-full"
            onClick={toggleCam}
            aria-label={cameraOff ? "Turn camera on" : "Turn camera off"}
          >
            {cameraOff ? (
              <VideoOff className="h-5 w-5" />
            ) : (
              <Video className="h-5 w-5" />
            )}
          </Button>
        ) : null}
        <Button
          type="button"
          size="icon"
          className="h-12 w-12 rounded-full bg-red-600 hover:bg-red-500"
          onClick={onEnd}
          aria-label="End call"
        >
          <PhoneOff className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
