import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/components/Header';
import CameraView from '@/components/CameraView';
import { useCamera } from '@/hooks/useCamera';
import { useFaceRecognition } from '@/hooks/useFaceRecognition';
import { saveStudent, getStudentById } from '@/lib/attendanceService';
import { toast } from 'sonner';
import { UserPlus, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { videoRef, isStreaming, error: cameraError, startCamera, stopCamera, captureImage } = useCamera();
  const { isModelLoaded, isLoading: modelsLoading, error: modelError, detectFace, checkLiveness } = useFaceRecognition();

  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capturedDescriptor, setCapturedDescriptor] = useState<Float32Array | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [livenessStatus, setLivenessStatus] = useState<string>('');
  const [isLivenessVerified, setIsLivenessVerified] = useState(false);
  const [previousDescriptor, setPreviousDescriptor] = useState<any>(null);

  useEffect(() => {
    if (!isStreaming || !isModelLoaded || isCapturing) return;

    const interval = setInterval(async () => {
      if (!videoRef.current) return;

      const result = await checkLiveness(videoRef.current, previousDescriptor);
      setLivenessStatus(result.message);
      setPreviousDescriptor(result.descriptor);

      if (result.isLive) {
        setIsLivenessVerified(true);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isStreaming, isModelLoaded, isCapturing, checkLiveness, previousDescriptor, videoRef]);

  const handleCapture = useCallback(async () => {
    if (!videoRef.current || !isModelLoaded) return;

    setIsCapturing(true);
    
    try {
      const detection = await detectFace(videoRef.current);
      
      if (!detection) {
        toast.error('No face detected. Please position your face clearly in the frame.');
        setIsCapturing(false);
        return;
      }

      const image = captureImage();
      if (!image) {
        toast.error('Failed to capture image. Please try again.');
        setIsCapturing(false);
        return;
      }

      setCapturedDescriptor(detection.descriptor);
      setCapturedImage(image);
      stopCamera();
      toast.success('Face captured successfully!');
    } catch (err) {
      toast.error('Failed to capture face. Please try again.');
      console.error('Capture error:', err);
    } finally {
      setIsCapturing(false);
    }
  }, [videoRef, isModelLoaded, detectFace, captureImage, stopCamera]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter student name');
      return;
    }

    if (!studentId.trim()) {
      toast.error('Please enter student ID');
      return;
    }

    if (!capturedDescriptor || !capturedImage) {
      toast.error('Please capture your face first');
      return;
    }

    if (!isLivenessVerified) {
      toast.error('Liveness verification failed. Please recapture your face.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if student ID already exists
      const existing = await getStudentById(studentId.trim());
      if (existing) {
        toast.error('A student with this ID is already registered');
        setIsSubmitting(false);
        return;
      }

      const { error } = await saveStudent({
        studentId: studentId.trim(),
        name: name.trim(),
        faceDescriptor: capturedDescriptor,
        faceImage: capturedImage,
      });

      if (error) {
        toast.error(error.message);
        setIsSubmitting(false);
        return;
      }

      toast.success(`Student ${name} registered successfully!`);
      
      // Reset form
      setName('');
      setStudentId('');
      setCapturedDescriptor(null);
      setCapturedImage(null);
      setIsLivenessVerified(false);
      setLivenessStatus('');
      setPreviousDescriptor(null);

      setTimeout(() => {
        navigate('/attendance');
      }, 1500);
    } catch (err) {
      toast.error('Failed to register student. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [name, studentId, capturedDescriptor, capturedImage, isLivenessVerified, navigate]);

  const handleRetake = useCallback(() => {
    setCapturedDescriptor(null);
    setCapturedImage(null);
    setIsLivenessVerified(false);
    setLivenessStatus('');
    setPreviousDescriptor(null);
    startCamera();
  }, [startCamera]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8 md:py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Student Registration</h1>
            <p className="text-muted-foreground">
              Register by providing your details and capturing your face
            </p>
          </div>

          {/* Model loading status */}
          {modelsLoading && (
            <div className="mb-6 flex items-center justify-center gap-3 rounded-lg bg-secondary p-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading face recognition models...</span>
            </div>
          )}

          {modelError && (
            <div className="mb-6 flex items-center gap-3 rounded-lg bg-destructive/10 p-4 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{modelError}</span>
            </div>
          )}

          <div className="rounded-xl bg-card p-6 shadow-card">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Form Fields */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter student name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isCapturing || isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input
                    id="studentId"
                    placeholder="Enter student ID"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    disabled={isCapturing || isSubmitting}
                  />
                </div>
              </div>

              {/* Camera / Captured Image */}
              <div className="space-y-4">
                <Label>Face Capture</Label>
                
                {capturedImage ? (
                  <div className="space-y-4">
                    <div className="relative overflow-hidden rounded-xl">
                      <img 
                        src={capturedImage} 
                        alt="Captured face" 
                        className="w-full h-auto"
                      />
                      <div className="absolute top-4 right-4 flex items-center gap-2 rounded-full bg-success px-3 py-1.5 text-sm font-medium text-success-foreground">
                        <CheckCircle className="h-4 w-4" />
                        Face Captured
                      </div>
                    </div>
                    <Button type="button" variant="outline" onClick={handleRetake} className="w-full" disabled={isSubmitting}>
                      Retake Photo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <CameraView
                      videoRef={videoRef}
                      isStreaming={isStreaming}
                      error={cameraError}
                      onStartCamera={startCamera}
                      isProcessing={isCapturing}
                      overlayMessage={isStreaming ? livenessStatus : undefined}
                      overlayType={isLivenessVerified ? 'success' : 'info'}
                      showScanEffect={isStreaming && !isCapturing}
                      className="aspect-video"
                    />
                    
                    {isStreaming && (
                      <Button
                        type="button"
                        onClick={handleCapture}
                        disabled={!isModelLoaded || isCapturing || !isLivenessVerified}
                        className="w-full"
                        size="lg"
                      >
                        {isCapturing ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Capturing...
                          </>
                        ) : !isLivenessVerified ? (
                          'Verifying Liveness...'
                        ) : (
                          'Capture Face'
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                variant="hero"
                disabled={!capturedDescriptor || !capturedImage || !name || !studentId || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5" />
                    Complete Registration
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;
