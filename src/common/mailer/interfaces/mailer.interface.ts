export type Email = `${string}@${string}.${string}`;

export interface TransportOptions {
  service: string;
  auth: {
    user: Email;
    pass: string;
  };
}

export interface MailOptions {
  from: Email;
  to: string;
  subject: string;
  text?: string;
  html?: string;
}
