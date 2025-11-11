import { useState, useEffect, useRef } from 'react';

interface VideoRoomProps {
  channelId: string;
  username: string;
}

export default function VideoRoom({ channelId, username }: VideoRoomProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    startVideo();
    return () => {
      stopVideo();
    };
  }, []);

  const startVideo = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
    } catch (error) {
      console.error('Error al acceder a la cámara/micrófono:', error);
      alert('No se pudo acceder a la cámara o micrófono. Verifica los permisos.');
    }
  };

  const stopVideo = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <div className="flex-1 relative p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
          {/* Video local */}
          <div className="relative bg-gray-800 rounded-lg overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
              {username} (Tú)
            </div>
          </div>

          {/* Video remoto (placeholder por ahora) */}
          <div className="relative bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover hidden"
            />
            <div className="text-gray-400 text-center">
              <svg
                className="w-24 h-24 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 4 0 011 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <p>Esperando a otros usuarios...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <div className="flex justify-center gap-4">
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full transition-colors ${
              isVideoEnabled
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-red-600 hover:bg-red-700'
            }`}
            title={isVideoEnabled ? 'Desactivar video' : 'Activar video'}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isVideoEnabled ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              )}
            </svg>
          </button>

          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full transition-colors ${
              isAudioEnabled
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-red-600 hover:bg-red-700'
            }`}
            title={isAudioEnabled ? 'Desactivar audio' : 'Activar audio'}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isAudioEnabled ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              )}
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

