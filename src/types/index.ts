export type Role = 'TEACHER' | 'STUDENT';

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  group_id?: number;
}

export interface Room {
  id: number;
  name: string;
  capacity: number;
}

export interface Group {
  id: number;
  name: string;
}

export interface Event {
  id: number;
  teacher_id: number;
  group_id: number;
  room_id: number;
  date: string;
  time: string;
  description: string;
}

export interface Grade {
  id: number;
  event_id: number;
  student_id: number;
  grade: number;
  comment: string;
  student_name?: string;
  teacher_name?: string;
  date?: string;
  time?: string;
  description?: string;
}
