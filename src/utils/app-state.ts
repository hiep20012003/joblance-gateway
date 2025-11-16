import { Request, Response } from 'express';

export const COOKIE_NAME = 'appState';

export interface AppState {
  verificationEmailSuccess?: boolean;
  registrationSellerSuccess?: string;
  theme?: 'light' | 'dark';
  [key: string]: unknown;
}

export function getAppState(req: Request): AppState {
  const cookies = req.cookies as Record<string, string | undefined>;
  const raw = cookies[COOKIE_NAME];
  if (!raw) return {};

  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as AppState;
    }
  } catch {
    return {};
  }

  return {};
}


export function setAppState(
  res: Response,
  req: Request,
  newData: Partial<AppState>,
  ttlSeconds: number = 3600 // default = 1h
): void {
  const current = getAppState(req);
  const updated: AppState = { ...current, ...newData };

  res.cookie(COOKIE_NAME, JSON.stringify(updated), {
    httpOnly: false, // frontend can read if needed
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ttlSeconds * 1000,
  });
}

export function clearAppState(res: Response): void {
  res.clearCookie(COOKIE_NAME, { path: '/' });
}
