/**
 * Validador de firma HMAC para webhooks de Twilio
 * Fail-closed: rechaza si firma inválida
 */

import * as crypto from 'crypto';

/**
 * Valida la firma HMAC de un webhook de Twilio
 * @param authToken Token de autenticación de Twilio (TWILIO_AUTH_TOKEN)
 * @param url URL completa del webhook
 * @param params Parámetros del request (body o query)
 * @param signature Firma recibida en header X-Twilio-Signature
 * @returns true si firma es válida, false en caso contrario
 */
export function validateTwilioSignature(
  authToken: string,
  url: string,
  params: Record<string, string>,
  signature: string
): boolean {
  if (!authToken || !signature) {
    return false;
  }

  // Ordenar parámetros alfabéticamente
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}${params[key]}`)
    .join('');

  // Construir string a firmar: URL + parámetros ordenados
  const data = url + sortedParams;

  // Calcular HMAC-SHA1
  const hmac = crypto.createHmac('sha1', authToken);
  hmac.update(data);
  const calculatedSignature = hmac.digest('base64');

  // Comparación en tiempo constante para prevenir timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(calculatedSignature)
  );
}

