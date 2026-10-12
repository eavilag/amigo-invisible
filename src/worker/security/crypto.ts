/** Generación y hash de identificadores y secretos (ADR-0006, ADR-0008). */

function base64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function randomBase64Url(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

/** Identificador público de 128 bits (22 caracteres). */
export const newId = (): string => randomBase64Url(16);

/** Secreto de 256 bits (43 caracteres): clave de organizador o token de participante. */
export const newSecret = (): string => randomBase64Url(32);

/** SHA-256 en hexadecimal. Adecuado para secretos de alta entropía (ADR-0008). */
export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}
