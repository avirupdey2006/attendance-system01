import { Student, AttendanceRecord } from '@/types/attendance';

const STUDENTS_KEY = 'attendance_students';
const ATTENDANCE_KEY = 'attendance_records';

export const saveStudent = (student: Student): void => {
  const students = getStudents();
  const existingIndex = students.findIndex(s => s.studentId === student.studentId);
  
  if (existingIndex >= 0) {
    students[existingIndex] = student;
  } else {
    students.push(student);
  }
  
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
};

export const getStudents = (): Student[] => {
  const data = localStorage.getItem(STUDENTS_KEY);
  if (!data) return [];
  
  try {
    const parsed = JSON.parse(data);
    return parsed.map((s: any) => ({
      ...s,
      faceDescriptor: new Float32Array(s.faceDescriptor),
      registeredAt: new Date(s.registeredAt),
    }));
  } catch {
    return [];
  }
};

export const getStudentById = (studentId: string): Student | null => {
  const students = getStudents();
  return students.find(s => s.studentId === studentId) || null;
};

export const deleteStudent = (studentId: string): void => {
  const students = getStudents().filter(s => s.studentId !== studentId);
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
};

export const markAttendance = (record: AttendanceRecord): void => {
  const records = getAttendanceRecords();
  records.push(record);
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
};

export const getAttendanceRecords = (): AttendanceRecord[] => {
  const data = localStorage.getItem(ATTENDANCE_KEY);
  if (!data) return [];
  
  try {
    const parsed = JSON.parse(data);
    return parsed.map((r: any) => ({
      ...r,
      timestamp: new Date(r.timestamp),
    }));
  } catch {
    return [];
  }
};

export const getAttendanceByDate = (date: Date): AttendanceRecord[] => {
  const records = getAttendanceRecords();
  const dateStr = date.toISOString().split('T')[0];
  
  return records.filter(r => {
    const recordDate = new Date(r.timestamp).toISOString().split('T')[0];
    return recordDate === dateStr;
  });
};

export const hasMarkedAttendanceToday = (studentId: string): boolean => {
  const today = new Date();
  const todayRecords = getAttendanceByDate(today);
  return todayRecords.some(r => r.studentId === studentId);
};

export const findMatchingStudent = (
  descriptor: Float32Array,
  students: Student[],
  threshold: number = 0.5
): Student | null => {
  let bestMatch: Student | null = null;
  let bestDistance = threshold;

  for (const student of students) {
    const distance = euclideanDistance(descriptor, student.faceDescriptor);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestMatch = student;
    }
  }

  return bestMatch;
};

const euclideanDistance = (arr1: Float32Array, arr2: Float32Array): number => {
  let sum = 0;
  for (let i = 0; i < arr1.length; i++) {
    sum += Math.pow(arr1[i] - arr2[i], 2);
  }
  return Math.sqrt(sum);
};
