export type Role = 'ADMIN' | 'USER';

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  created_at: string;
}

export type RequestStatus = 'pending' | 'processing' | 'completed' | 'archived';

export interface PrintRequest {
  id: number;
  user_id: number;
  full_name: string;
  student_group: string;
  comment: string;
  status: RequestStatus;
  created_at: string;
  user_email?: string; // Only for admin view
}
