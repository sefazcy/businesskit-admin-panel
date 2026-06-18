export interface StaffWorkingHour {
  id: number;
  staffMemberId: number;
  staffMemberName: string;
  dayOfWeek: number;
  dayName: string;
  startTime: string | null;
  endTime: string | null;
  isWorkingDay: boolean;
  breakStartTime: string | null;
  breakEndTime: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkingHourRequest {
  staffMemberId: number;
  dayOfWeek: number;
  startTime: string | null;
  endTime: string | null;
  isWorkingDay: boolean;
  breakStartTime: string | null;
  breakEndTime: string | null;
}

export interface UpdateWorkingHourRequest {
  dayOfWeek: number;
  startTime: string | null;
  endTime: string | null;
  isWorkingDay: boolean;
  breakStartTime: string | null;
  breakEndTime: string | null;
}
