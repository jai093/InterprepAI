
import { useRef, useState, useCallback } from "react";

interface RecordingResult {
  videoBlob: Blob | null;
  audioBlob: Blob | null;
  videoUrl: string | null;
  audioUrl: string | null;
  isRecording: boolean;
  start: (stream: MediaStream) => void;
  stop: () => void;
  clear: () => void;
}

export function useInterviewRecorder(): RecordingResult {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const start = useCallback((stream: MediaStream) => {
    if (!stream) return;
    setVideoBlob(null);
    setAudioBlob(null);
    setVideoUrl(null);
    setAudioUrl(null);

    const recorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp8,opus"
    });
    let chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
      }
    };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      setVideoBlob(blob);
      setAudioBlob(blob); // for now, use the same for both
      setVideoUrl(URL.createObjectURL(blob));
      setAudioUrl(URL.createObjectURL(blob));
      chunks = [];
    };
    recorder.start();
    recorderRef.current = recorder;
    setIsRecording(true);
  }, []);

  const stop = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  const clear = useCallback(() => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setVideoUrl(null);
    setAudioUrl(null);
    setVideoBlob(null);
    setAudioBlob(null);
  }, [videoUrl, audioUrl]);

  return {
    videoBlob,
    audioBlob,
    videoUrl,
    audioUrl,
    isRecording,
    start,
    stop,
    clear
  };
}
