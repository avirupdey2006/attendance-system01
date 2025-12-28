import { useCallback, useRef, useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';

interface FaceDescriptor {
  descriptor: Float32Array;
  timestamp: number;
}

interface UseFaceRecognitionReturn {
  isModelLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  detectFace: (video: HTMLVideoElement) => Promise<faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }, faceapi.FaceLandmarks68>> | null>;
  compareFaces: (descriptor1: Float32Array, descriptor2: Float32Array) => number;
  checkLiveness: (video: HTMLVideoElement, previousDescriptor: FaceDescriptor | null) => Promise<{ isLive: boolean; descriptor: FaceDescriptor | null; message: string }>;
}

const MODEL_URL = '/models';

export const useFaceRecognition = (): UseFaceRecognitionReturn => {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const blinkHistoryRef = useRef<boolean[]>([]);
  const lastEARRef = useRef<number>(0);

  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setIsModelLoaded(true);
        setError(null);
      } catch (err) {
        setError('Failed to load face recognition models. Please ensure models are available.');
        console.error('Model loading error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadModels();
  }, []);

  const calculateEAR = (landmarks: faceapi.FaceLandmarks68): number => {
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();

    const eyeAspectRatio = (eye: faceapi.Point[]) => {
      const vertical1 = Math.sqrt(
        Math.pow(eye[1].x - eye[5].x, 2) + Math.pow(eye[1].y - eye[5].y, 2)
      );
      const vertical2 = Math.sqrt(
        Math.pow(eye[2].x - eye[4].x, 2) + Math.pow(eye[2].y - eye[4].y, 2)
      );
      const horizontal = Math.sqrt(
        Math.pow(eye[0].x - eye[3].x, 2) + Math.pow(eye[0].y - eye[3].y, 2)
      );
      return (vertical1 + vertical2) / (2.0 * horizontal);
    };

    return (eyeAspectRatio(leftEye) + eyeAspectRatio(rightEye)) / 2;
  };

  const detectFace = useCallback(async (video: HTMLVideoElement) => {
    if (!isModelLoaded) return null;

    try {
      const detection = await faceapi
        .detectSingleFace(video)
        .withFaceLandmarks()
        .withFaceDescriptor();

      return detection || null;
    } catch (err) {
      console.error('Face detection error:', err);
      return null;
    }
  }, [isModelLoaded]);

  const compareFaces = useCallback((descriptor1: Float32Array, descriptor2: Float32Array): number => {
    return faceapi.euclideanDistance(descriptor1, descriptor2);
  }, []);

  const checkLiveness = useCallback(async (
    video: HTMLVideoElement,
    previousDescriptor: FaceDescriptor | null
  ): Promise<{ isLive: boolean; descriptor: FaceDescriptor | null; message: string }> => {
    const detection = await detectFace(video);

    if (!detection) {
      return { isLive: false, descriptor: null, message: 'No face detected' };
    }

    const currentEAR = calculateEAR(detection.landmarks);
    const earThreshold = 0.21;
    const earDiff = lastEARRef.current - currentEAR;
    
    // Detect blink (significant drop in EAR)
    const isBlink = earDiff > 0.05 && currentEAR < earThreshold;
    
    blinkHistoryRef.current.push(isBlink);
    if (blinkHistoryRef.current.length > 30) {
      blinkHistoryRef.current.shift();
    }
    
    lastEARRef.current = currentEAR;

    const blinkCount = blinkHistoryRef.current.filter(Boolean).length;
    const hasNaturalBlinks = blinkCount >= 1;

    // Check for movement between frames
    let hasMovement = true;
    if (previousDescriptor) {
      const distance = compareFaces(detection.descriptor, previousDescriptor.descriptor);
      const timeDiff = Date.now() - previousDescriptor.timestamp;
      // Small movements indicate a real person, not a static photo
      hasMovement = distance > 0.01 && distance < 0.6 && timeDiff < 2000;
    }

    const currentDescriptor: FaceDescriptor = {
      descriptor: detection.descriptor,
      timestamp: Date.now(),
    };

    // Check face box size (too small might be a photo from distance)
    const faceBox = detection.detection.box;
    const faceArea = faceBox.width * faceBox.height;
    const videoArea = video.videoWidth * video.videoHeight;
    const faceSizeRatio = faceArea / videoArea;
    const hasValidSize = faceSizeRatio > 0.02 && faceSizeRatio < 0.8;

    if (!hasValidSize) {
      return { 
        isLive: false, 
        descriptor: currentDescriptor, 
        message: 'Please position your face closer to the camera' 
      };
    }

    if (!hasNaturalBlinks && blinkHistoryRef.current.length >= 20) {
      return { 
        isLive: false, 
        descriptor: currentDescriptor, 
        message: 'Please blink naturally to verify liveness' 
      };
    }

    return { 
      isLive: hasValidSize && (hasNaturalBlinks || blinkHistoryRef.current.length < 20), 
      descriptor: currentDescriptor, 
      message: hasNaturalBlinks ? 'Liveness verified' : 'Verifying liveness...' 
    };
  }, [detectFace, compareFaces]);

  return {
    isModelLoaded,
    isLoading,
    error,
    detectFace,
    compareFaces,
    checkLiveness,
  };
};
