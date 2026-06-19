export interface Appointment {
  id: number;
  customerId: number | null;
  customerLinkedFullName: string | null;
  customerFullName: string;
  customerEmail: string | null;
  customerPhone: string;
  staffMemberId: number | null;
  staffMemberName: string | null;
  businessServiceId: number | null;
  businessServiceTitle: string | null;
  requestedDate: string;
  requestedTime: string;
  note: string | null;
  status: string;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentStats {
  totalAppointments: number;
  pendingCount: number;
  confirmedCount: number;
  cancelledCount: number;
  completedCount: number;
  todayCount: number;
  upcoming7DaysCount: number;
}

export interface UpdateStatusRequest {
  status: string;
  adminNote: string | null;
}

export interface UpdateAppointmentRequest {
  customerFullName: string;
  customerEmail: string | null;
  customerPhone: string;
  staffMemberId: number | null;
  businessServiceId: number | null;
  requestedDate: string;
  requestedTime: string;
  note: string | null;
  status: string;
  adminNote: string | null;
  customerId: number | null;
}
