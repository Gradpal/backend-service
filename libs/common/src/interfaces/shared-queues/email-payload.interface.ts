export interface EmailQueuePayload {
  htmlTemplate: string;
  emailRecipients: string[];
  subject: string;
  optionalData?: Record<string, string | number | object>;
}
