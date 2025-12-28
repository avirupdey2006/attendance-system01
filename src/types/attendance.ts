export interface Student {
  id: string;
  studentId: string;
  name: string;
  faceDescriptor: Float32Array;
  faceImage: string;
  registeredAt: Date;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  timestamp: Date;
  verified: boolean;
  livenessScore: number;
}

export interface AdminCredentials {
  username: string;
  password: string;
}
