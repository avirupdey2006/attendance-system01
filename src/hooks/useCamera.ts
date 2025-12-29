import { useRef, useEffect, useState, useCallback } from 'react';

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  isStreaming: boolean;
  error: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  captureImage: () => string | null;
}

export const useCamera = (): UseCameraReturn => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track mount state
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (mountedRef.current) {
      setIsStreaming(false);
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      if (mountedRef.current) setError(null);

      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      // Only proceed if still mounted
      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      setIsStreaming(true);
    } catch (err) {
      if (!mountedRef.current) return;
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera';
      setError(errorMessage);
      console.error('Camera error:', err);
    }
  }, []);

  // Attach stream to <video> element after React renders it
  useEffect(() => {
    if (!isStreaming) return;

    const video = videoRef.current;
    const stream = streamRef.current;
    if (!video || !stream) return;

    if (video.srcObject !== stream) {
      video.srcObject = stream;
    }

    let cancelled = false;

    const playVideo = async () => {
      try {
        if (video.readyState < 1) {
          await new Promise<void>((resolve, reject) => {
            const onLoaded = () => resolve();
            const onError = () => reject(new Error('Video load failed'));
            video.addEventListener('loadedmetadata', onLoaded, { once: true });
            video.addEventListener('error', onError, { once: true });
          });
        }
        if (cancelled || !mountedRef.current) return;
        await video.play();
      } catch (e) {
        console.warn('Video play() blocked or failed:', e);
      }
    };

    playVideo();

    return () => {
      cancelled = true;
    };
  }, [isStreaming]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const captureImage = useCallback((): string | null => {
    if (!videoRef.current || !isStreaming) return null;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(videoRef.current, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.8);
  }, [isStreaming]);

  return {
    videoRef,
    isStreaming,
    error,
    startCamera,
    stopCamera,
    captureImage,
  };
};
