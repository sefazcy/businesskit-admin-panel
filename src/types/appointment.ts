export interface Appointment {
  id: number;
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
