export type CookieConsentCategory = 'required' | 'functional' | 'tracking';

export interface CookieConsentOptions {
  options: {
    id: CookieConsentCategory;
    messageKeyTitle: string;
    messageKeyContent: string;
    required?: boolean;
  }[];
  allowedCookies?: string[];
}

export interface CookieConsentSettings {
  enabledCookies: CookieConsentCategory[];
  version: number;
}
