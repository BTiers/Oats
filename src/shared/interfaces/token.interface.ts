export interface Token {
  expiresIn: number;
  token: string;
}

export interface XSRFTokenData {}

export interface RefreshTokenData {
  xsrfToken: string;
  _exp: number;
  sub: number;
}
