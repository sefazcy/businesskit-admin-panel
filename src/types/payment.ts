export interface Payment {
  id: number;
  appointmentId: number;
  customerId: number | null;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  providerPaymentId: string | null;
  providerCheckoutUrl: string | null;
  paidAt: string | null;
  failedAt: string | null;
  refundedAt: string | null;
  failureReason: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MarkFailedRequest {
  failureReason: string | null;
}

export interface MarkRefundedRequest {
  notes: string | null;
}
