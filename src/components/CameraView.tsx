import { useRef, useEffect } from 'react';
import { Camera, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isStreaming: boolean;
  error: string | null;
  onStartCamera: () => void;
  isProcessing?: boolean;
  overlayMessage?: string;
  overlayType?: 'success' | 'error' | 'warning' | 'info';
  showScanEffect?: boolean;
  className?: string;
}

const CameraView = ({
  videoRef,
  isStreaming,
  error,
  onStartCamera,
  isProcessing = false,
  overlayMessage,
  overlayType = 'info',
  showScanEffect = false,
  className,
}: CameraViewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!showScanEffect || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let scanY = 0;
    const scanSpeed = 2;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw scan line
      const gradient = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(0.5, 'rgba(234, 179, 8, 0.6)');
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, scanY - 20, canvas.width, 40);

      scanY += scanSpeed;
      if (scanY > canvas.height + 20) {
        scanY = -20;
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [showScanEffect]);

  const overlayColors = {
    success: 'bg-success/20 border-success text-success',
    error: 'bg-destructive/20 border-destructive text-destructive',
    warning: 'bg-accent/20 border-accent text-accent-foreground',
    info: 'bg-primary/20 border-primary text-primary',
  };

  return (
    <div className={cn('relative overflow-hidden rounded-xl bg-secondary', className)}>
      {!isStreaming ? (
        <button
          onClick={onStartCamera}
          className="flex flex-col items-center justify-center w-full h-full min-h-[320px] gap-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Camera className="h-10 w-10 text-primary" />
          </div>
          <span className="text-lg font-medium">Click to start camera</span>
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </button>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {/* Face detection frame overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-[15%] border-2 border-dashed border-accent/50 rounded-xl" />
            <div className="absolute top-[15%] left-[15%] w-6 h-6 border-t-2 border-l-2 border-accent rounded-tl-lg" />
            <div className="absolute top-[15%] right-[15%] w-6 h-6 border-t-2 border-r-2 border-accent rounded-tr-lg" />
            <div className="absolute bottom-[15%] left-[15%] w-6 h-6 border-b-2 border-l-2 border-accent rounded-bl-lg" />
            <div className="absolute bottom-[15%] right-[15%] w-6 h-6 border-b-2 border-r-2 border-accent rounded-br-lg" />
          </div>

          {showScanEffect && (
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />
          )}

          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <span className="text-sm font-medium">Processing...</span>
              </div>
            </div>
          )}

          {overlayMessage && (
            <div className={cn(
              'absolute bottom-4 left-4 right-4 p-4 rounded-lg border-2 backdrop-blur-sm animate-fade-in',
              overlayColors[overlayType]
            )}>
              <p className="text-center font-semibold">{overlayMessage}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CameraView;
