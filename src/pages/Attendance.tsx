import { useState, useEffect, useCallback, useRef } from 'react';
import Header from '@/components/Header';
import CameraView from '@/components/CameraView';
import AttendanceConfirmation from '@/components/AttendanceConfirmation';
import { useCamera } from '@/hooks/useCamera';
import { useFaceRecognition } from '@/hooks/useFaceRecognition';
import { 
  getStudents, 
  markAttendance, 
  hasMarkedAttendanceToday,
  findMatchingStudent 
} from '@/lib/attendanceStorage';
import { AttendanceRecord, Student } from '@/types/attendance';
import { toast } from 'sonner';
import { Camera, AlertCircle, Loader2, Users, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Attendance = () => {
  const { videoRef, isStreaming, error: cameraError, startCamera, stopCamera } = useCamera();
  const { isModelLoaded, isLoading: modelsLoading, error: modelError, detectFace, checkLiveness } = useFaceRecognition();

  const [students, setStudents] = useState<Student[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState<string>('');
  const [overlayType, setOverlayType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmedStudent, setConfirmedStudent] = useState<{ name: string; id: string; time: Date } | null>(null);
  const [previousDescriptor, setPreviousDescriptor] = useState<any>(null);
  const [todayCount, setTodayCount] = useState(0);
  
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownRef = useRef<string | null>(null);

  useEffect(() => {
    const loadedStudents = getStudents();
    setStudents(loadedStudents);
    
    // Count today's attendance
    const today = new Date().toISOString().split('T')[0];
    const records = JSON.parse(localStorage.getItem('attendance_records') || '[]');
    const todayRecords = records.filter((r: any) => 
      new Date(r.timestamp).toISOString().split('T')[0] === today
    );
    setTodayCount(todayRecords.length);
  }, []);

  const handleAttendanceMarked = useCallback((student: Student) => {
    if (cooldownRef.current === student.studentId) return;
    
    // Check if already marked today
    if (hasMarkedAttendanceToday(student.studentId)) {
      setOverlayMessage(`${student.name} - Already marked today`);
      setOverlayType('warning');
      return;
    }

    const timestamp = new Date();
    const record: AttendanceRecord = {
      id: crypto.randomUUID(),
      studentId: student.studentId,
      studentName: student.name,
      timestamp,
      verified: true,
      livenessScore: 1.0,
    };

    markAttendance(record);
    setTodayCount(prev => prev + 1);
    
    // Set cooldown to prevent multiple marks
    cooldownRef.current = student.studentId;
    setTimeout(() => {
      cooldownRef.current = null;
    }, 5000);

    // Show confirmation
    setConfirmedStudent({
      name: student.name,
      id: student.studentId,
      time: timestamp,
    });
    setShowConfirmation(true);
    
    // Hide confirmation after 3 seconds
    setTimeout(() => {
      setShowConfirmation(false);
      setConfirmedStudent(null);
    }, 3000);

    toast.success(`Attendance marked for ${student.name}`);
  }, []);

  useEffect(() => {
    if (!isStreaming || !isModelLoaded || students.length === 0) return;

    setIsScanning(true);
    let isProcessing = false;

    const scanInterval = setInterval(async () => {
      if (isProcessing || !videoRef.current || showConfirmation) return;
      
      isProcessing = true;

      try {
        // Check liveness first
        const livenessResult = await checkLiveness(videoRef.current, previousDescriptor);
        setPreviousDescriptor(livenessResult.descriptor);

        if (!livenessResult.descriptor) {
          setOverlayMessage('Position your face in the frame');
          setOverlayType('info');
          isProcessing = false;
          return;
        }

        if (!livenessResult.isLive) {
          setOverlayMessage(livenessResult.message);
          setOverlayType('warning');
          isProcessing = false;
          return;
        }

        // Face detected and live - try to match
        const detection = await detectFace(videoRef.current);
        if (!detection) {
          isProcessing = false;
          return;
        }

        const matchedStudent = findMatchingStudent(detection.descriptor, students, 0.5);

        if (matchedStudent) {
          handleAttendanceMarked(matchedStudent);
        } else {
          setOverlayMessage('Face not recognized. Please register first.');
          setOverlayType('error');
        }
      } catch (err) {
        console.error('Scan error:', err);
      } finally {
        isProcessing = false;
      }
    }, 1000);

    return () => {
      clearInterval(scanInterval);
      setIsScanning(false);
    };
  }, [isStreaming, isModelLoaded, students, showConfirmation, detectFace, checkLiveness, handleAttendanceMarked, previousDescriptor, videoRef]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8 md:py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Camera className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Mark Attendance</h1>
            <p className="text-muted-foreground">
              Look at the camera to automatically mark your attendance
            </p>
          </div>

          {/* Stats */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-card p-4 shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registered Students</p>
                  <p className="text-2xl font-bold text-foreground">{students.length}</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-card p-4 shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Today's Attendance</p>
                  <p className="text-2xl font-bold text-foreground">{todayCount}</p>
                </div>
              </div>
            </div>
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

          {students.length === 0 ? (
            <div className="rounded-xl bg-card p-8 text-center shadow-card">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">No Students Registered</h3>
              <p className="mb-6 text-muted-foreground">
                Please register students first before marking attendance.
              </p>
              <Button asChild>
                <Link to="/register">Register Student</Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-xl bg-card p-6 shadow-card">
              <CameraView
                videoRef={videoRef}
                isStreaming={isStreaming}
                error={cameraError}
                onStartCamera={startCamera}
                overlayMessage={isStreaming ? overlayMessage : undefined}
                overlayType={overlayType}
                showScanEffect={isStreaming && isScanning && !showConfirmation}
                className="aspect-video"
              />
              
              {isStreaming && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  Scanning for faces...
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Attendance Confirmation Overlay */}
      {confirmedStudent && (
        <AttendanceConfirmation
          studentName={confirmedStudent.name}
          studentId={confirmedStudent.id}
          timestamp={confirmedStudent.time}
          isVisible={showConfirmation}
        />
      )}
    </div>
  );
};

export default Attendance;
