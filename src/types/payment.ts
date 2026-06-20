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

export interface CreatePaymentRequest {
  amount: number;
  currency: string;
}

export interface PaymentCurrencySummary {
  currency: string;
  pendingAmount: number;
  paidAmount: number;
  failedAmount: number;
  refundedAmount: number;
  totalAmount: number;
}

export interface PaymentSummaryStats {
  totalCount: number;
  pendingCount: number;
  paidCount: number;
  failedCount: number;
  refundedCount: number;
  totalsByCurrency: PaymentCurrencySummary[];
}
