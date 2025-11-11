import { useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

interface VideoRoomProps {
  channelId: string;
  username: string;
}


export default function VideoRoom({ channelId, username }: VideoRoomProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // SERVERS ICE (Google)
  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" }
    ]
  };

useEffect(() => {
  if (peerRef.current) return; // evita doble inicialización
  initConnection();
  return () => cleanup();
}, []);


  const initConnection = async () => {
    if (!supabase) {
      console.error("❌ Supabase no está inicializado");
      return;
    }

    // 1) OBTENER VIDEO LOCAL
    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }

    localStreamRef.current = localStream;

    // 2) CREAR PEER
    const peer = new RTCPeerConnection(iceServers);
    peerRef.current = peer;

    // Enviar ICE a Supabase
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignalingMessage("ice", event.candidate);
      }
    };

    // Mostrar video remoto
    peer.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        remoteVideoRef.current.classList.remove("hidden");
      }
    };

    // Agregar tracks locales a peer
    localStream.getTracks().forEach((track) => {
      peer.addTrack(track, localStream);
    });

    // 3) Escuchar señales entrantes desde Supabase
    supabase
      .channel(`room-${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`
        },
        (payload) => handleSignal(payload.new)
      )
      .subscribe();

    // 4) Crear offer inicial
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    sendSignalingMessage("offer", offer);
  };

  // Procesar señales entrantes
  const handleSignal = async (msg: any) => {
    if (msg.username === username) return;

    const peer = peerRef.current;
    if (!peer) return;

    if (msg.type === "offer") {
      await peer.setRemoteDescription(new RTCSessionDescription(msg.content));

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      sendSignalingMessage("answer", answer);
    }

    if (msg.type === "answer") {
      await peer.setRemoteDescription(new RTCSessionDescription(msg.content));
    }

    if (msg.type === "ice") {
      try {
        await peer.addIceCandidate(new RTCIceCandidate(msg.content));
      } catch (e) {
        console.error("Error ICE:", e);
      }
    }
  };

  // Guardar señalización en Supabase
  const sendSignalingMessage = async (type: string, content: any) => {
    await supabase.from("messages").insert({
      channel_id: channelId,
      username,
      type,
      content
    });
  };

  // Limpieza
  const cleanup = () => {
    if (peerRef.current) peerRef.current.close();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }
  };

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h2 className="text-center mb-2">Tu cámara</h2>
        <video ref={localVideoRef} autoPlay playsInline muted className="w-full rounded-lg" />
      </div>

      <div>
        <h2 className="text-center mb-2">Remoto</h2>
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full rounded-lg hidden" />
      </div>
    </div>
  );
}
