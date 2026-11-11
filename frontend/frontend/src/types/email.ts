export interface Email {
  id: number;
  recipient: string;
  subject: string;
  body: string;
  scheduled_at: string;
  status: "SCHEDULED" | "PROCESSING" | "SENT" | "FAILED" | "CANCELLED";
  sent_at?: string | null;
  last_error?: string | null;
}

export interface EmailStats {
  total: number;
  scheduled: number;
  sent: number;
  failed: number;
  cancelled: number;
}