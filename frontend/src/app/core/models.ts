export type Role = 'admin' | 'resepsionis' | 'sekretaris';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  department?: string | null;
  role: Role;
  created_at?: string | null;
}

export interface Room {
  id: number;
  room_name: string;
  location: string;
  capacity: number;
  facilities?: string | null;
  status: 'available' | 'maintenance';
}

export type VisitorStatus = 'pending' | 'checked_in' | 'checked_out' | 'rejected';

export interface Visitor {
  id: number;
  visitor_name: string;
  visitor_email?: string | null;
  visitor_phone: string;
  company?: string | null;
  identity_number?: string | null;
  host_user_id: number;
  host_name?: string | null;
  created_by: number;
  purpose: string;
  visit_date: string;
  check_in_time?: string | null;
  check_out_time?: string | null;
  status: VisitorStatus;
  notes?: string | null;
  host?: User;
}

export type MeetingStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';

export interface Meeting {
  id: number;
  title: string;
  description?: string | null;
  room_id: number;
  organizer_id: number;
  meeting_date: string;
  start_time: string;
  end_time: string;
  participant_count: number;
  status: MeetingStatus;
  room?: Room;
  organizer?: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
}

export interface StatusInfo {
  label: string;
  color: string;
}

export const VISITOR_STATUS: Record<string, StatusInfo> = {
  pending: { label: 'Menunggu', color: 'warning' },
  checked_in: { label: 'Di lokasi', color: 'success' },
  checked_out: { label: 'Selesai', color: 'medium' },
  rejected: { label: 'Ditolak', color: 'danger' },
};

export const MEETING_STATUS: Record<string, StatusInfo> = {
  pending: { label: 'Menunggu', color: 'warning' },
  approved: { label: 'Disetujui', color: 'success' },
  rejected: { label: 'Ditolak', color: 'danger' },
  completed: { label: 'Selesai', color: 'primary' },
  cancelled: { label: 'Dibatalkan', color: 'medium' },
};
