// Normaliza FIREBASE_PRIVATE_KEY tal como llega de una variable de entorno (.env.local o Vercel).
// firebase-admin 14 valida la clave con el crypto nativo de Node y rechaza lo que firebase-admin 12 toleraba:
// comillas envolventes, PEM en una sola línea con espacios y espacios sobrantes. Función pura y sin
// `server-only` para poder testearla en Vitest (lib/privateKey.test.ts).

const PEM_PATTERN = /^-----BEGIN ([A-Z ]+)-----\s*([\s\S]*?)\s*-----END \1-----\s*$/;

/**
 * Devuelve la clave en forma canónica PEM (cabecera, cuerpo en líneas de 64 caracteres, pie y salto final)
 * o `undefined` si la variable está vacía. Si el texto no es un PEM, se devuelve recortado para que
 * `cert()` lo rechace con su propio mensaje.
 */
export function normalizePrivateKey(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  let key = raw.trim();
  if (!key) return undefined;

  // Comillas envolventes: pasa al pegar el valor de un .env (que las lleva) en Vercel.
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1).trim();
  }

  // "\n" literales (formato del .env) → saltos reales; CRLF → LF.
  key = key.replace(/\\n/g, "\n").replace(/\r\n?/g, "\n");

  // Reconstruye el PEM: elimina cualquier espacio o salto del cuerpo y lo vuelve a partir en líneas de 64.
  const match = key.match(PEM_PATTERN);
  if (!match) return key;
  const label = match[1];
  const body = match[2].replace(/\s+/g, "");
  const lines = body.match(/.{1,64}/g) ?? [];
  return `-----BEGIN ${label}-----\n${lines.join("\n")}\n-----END ${label}-----\n`;
}
