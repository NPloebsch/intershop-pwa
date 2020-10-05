export interface CookieConsentOptions {
  options: {
    id: string;
    messageKeyTitle: string;
    messageKeyContent: string;
    required?: boolean;
  }[];
  allowedCookies?: string[];
}

export interface CookieConsentSettings {
  enabledCookies: string[];
  version: number;
}
