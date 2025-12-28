import { supabase } from '@/integrations/supabase/client';

export interface Student {
  id: string;
  student_id: string;
  name: string;
  face_descriptor: number[];
  face_image: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  student_name: string;
  marked_at: string;
  verified: boolean;
  liveness_score: number;
}

export const saveStudent = async (student: {
  studentId: string;
  name: string;
  faceDescriptor: Float32Array;
  faceImage: string;
}): Promise<{ data: Student | null; error: Error | null }> => {
  const { data, error } = await supabase
    .from('students')
    .insert({
      student_id: student.studentId,
      name: student.name,
      face_descriptor: Array.from(student.faceDescriptor),
      face_image: student.faceImage,
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return { 
    data: {
      ...data,
      face_descriptor: data.face_descriptor as number[]
    } as Student, 
    error: null 
  };
};

export const getStudents = async (): Promise<Student[]> => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching students:', error);
    return [];
  }

  return (data || []).map(s => ({
    ...s,
    face_descriptor: s.face_descriptor as number[]
  })) as Student[];
};

export const getStudentById = async (studentId: string): Promise<Student | null> => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('student_id', studentId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching student:', error);
    return null;
  }

  if (!data) return null;

  return {
    ...data,
    face_descriptor: data.face_descriptor as number[]
  } as Student;
};

export const deleteStudent = async (studentId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('students')
    .delete()
    .eq('student_id', studentId);

  if (error) {
    console.error('Error deleting student:', error);
    return false;
  }

  return true;
};

export const markAttendance = async (record: {
  studentId: string;
  studentName: string;
  livenessScore?: number;
}): Promise<{ data: AttendanceRecord | null; error: Error | null }> => {
  const { data, error } = await supabase
    .from('attendance_records')
    .insert({
      student_id: record.studentId,
      student_name: record.studentName,
      verified: true,
      liveness_score: record.livenessScore || 1.0,
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return { data: data as AttendanceRecord, error: null };
};

export const getAttendanceByDate = async (date: Date): Promise<AttendanceRecord[]> => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .gte('marked_at', startOfDay.toISOString())
    .lte('marked_at', endOfDay.toISOString())
    .order('marked_at', { ascending: false });

  if (error) {
    console.error('Error fetching attendance by date:', error);
    return [];
  }

  return (data || []) as AttendanceRecord[];
};

export const hasMarkedAttendanceToday = async (studentId: string): Promise<boolean> => {
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from('attendance_records')
    .select('id')
    .eq('student_id', studentId)
    .gte('marked_at', startOfDay.toISOString())
    .lte('marked_at', endOfDay.toISOString())
    .limit(1);

  if (error) {
    console.error('Error checking attendance:', error);
    return false;
  }

  return (data?.length || 0) > 0;
};

export const findMatchingStudent = (
  descriptor: Float32Array,
  students: Student[],
  threshold: number = 0.5
): Student | null => {
  let bestMatch: Student | null = null;
  let bestDistance = threshold;

  for (const student of students) {
    const studentDescriptor = new Float32Array(student.face_descriptor);
    const distance = euclideanDistance(descriptor, studentDescriptor);
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
