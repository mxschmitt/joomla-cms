import mailTester from 'smtp-tester';
import type { JoomlaTestConfig, MailMessage } from './types';

let mailServer: ReturnType<typeof mailTester.init> | null = null;
let cachedMails: MailMessage[] = [];

export async function getMails(): Promise<MailMessage[]> {
  for (let i = 0; i < 3; i += 1) {
    if (cachedMails.length !== 0) {
      break;
    }
    await new Promise((r) => {
      setTimeout(r, 1000);
    });
  }
  return cachedMails;
}

export function clearEmails(): null {
  cachedMails = [];
  return null;
}

export function startMailServer(config: JoomlaTestConfig): null {
  if (mailServer !== null) {
    return null;
  }
  try {
    mailServer = mailTester.init(Number(config.expose.smtp_port));
    mailServer.bind((_addr: unknown, _id: unknown, email: unknown) => {
      cachedMails.push(email as MailMessage);
    });
    cachedMails = [];
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EADDRINUSE') {
      // Playwright may load this module more than once (collector + worker).
      // Keep going; the process that won the bind still captures mail.
      return null;
    }
    throw error;
  }
  return null;
}
