import { Check, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttendanceConfirmationProps {
  studentName: string;
  studentId: string;
  timestamp: Date;
  isVisible: boolean;
}

const AttendanceConfirmation = ({
  studentName,
  studentId,
  timestamp,
  isVisible,
}: AttendanceConfirmationProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="relative mx-4 w-full max-w-md overflow-hidden rounded-2xl bg-card shadow-elegant animate-scale-in">
        {/* Success header */}
        <div className="bg-success p-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success-foreground/20 animate-pulse-glow">
            <Check className="h-10 w-10 text-success-foreground" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Attendance Marked!
          </h2>
          
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">{studentName}</p>
                <p className="text-sm text-muted-foreground">ID: {studentId}</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                {timestamp.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
              <span className="text-sm">•</span>
              <span className="text-sm">
                {timestamp.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            This window will close automatically
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-success/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
      </div>
    </div>
  );
};

export default AttendanceConfirmation;
