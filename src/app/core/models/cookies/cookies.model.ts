export type CookieConsentCategory = 'required' | 'functional' | 'tracking';

export interface CookieConsentOptions {
  options: {
    id: CookieConsentCategory;
    messageKeyTitle: string;
    messageKeyContent: string;
    required?: boolean;
  }[];
  allowedCookies?: string[];
  updatedAt: Date | string;
}

export interface CookieConsentSettings {
  updatedAt: Date | string;
  enabledCookies: CookieConsentCategory[];
}
