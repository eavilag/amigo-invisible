/** Cabeceras de seguridad aplicadas a TODAS las respuestas (ADR-0011). */
export const CONTENT_SECURITY_POLICY = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "manifest-src 'self'",
  "base-uri 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

/** Solo tienen sentido sobre HTTPS; en http://localhost WebKit las aplicaría y rompería el desarrollo. */
const HTTPS_ONLY_HEADERS: Readonly<Record<string, string>> = {
  'Content-Security-Policy': `${CONTENT_SECURITY_POLICY}; upgrade-insecure-requests`,
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
};

export const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  'Content-Security-Policy': CONTENT_SECURITY_POLICY,
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'X-Frame-Options': 'DENY',
  'X-Robots-Tag': 'noindex, nofollow',
};

/** Devuelve una copia mutable de la respuesta con las cabeceras de seguridad. */
export function withSecurityHeaders(response: Response, options: { https: boolean; extra?: Record<string, string> }): Response {
  const secured = new Response(response.body, response);
  const headers = { ...SECURITY_HEADERS, ...(options.https ? HTTPS_ONLY_HEADERS : {}), ...options.extra };
  for (const [name, value] of Object.entries(headers)) {
    secured.headers.set(name, value);
  }
  secured.headers.delete('X-Powered-By');
  return secured;
}
