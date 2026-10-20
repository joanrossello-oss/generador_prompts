export const INSTRUCCIONES_MEJORA = `Eres un experto en ingeniería de prompts. Mejora el prompt que aparece entre las etiquetas <prompt_original>.

Reglas:
- Conserva la intención original y el idioma del prompt.
- No inventes datos, requisitos ni contexto que yo no haya dado. Si falta información importante, añade al final una sección "## Preguntas abiertas".
- Mantén intactos los bloques de código, mensajes de error, nombres y valores literales.
- Haz explícitos el objetivo, el contexto, las restricciones y el formato de salida esperado.
- Elimina ambigüedades y redundancias; no alargues el prompt sin necesidad.
- Devuelve únicamente el prompt mejorado, en un bloque de código para poder copiarlo, sin explicaciones.`;

export const paraMejorar = (texto: string) =>
  `${INSTRUCCIONES_MEJORA}\n\n<prompt_original>\n${texto.trim()}\n</prompt_original>`;

/** Indica si el servidor opcional tiene clave de API configurada. */
export async function apiDisponible(): Promise<boolean> {
  try {
    const r = await fetch("/api/estado");
    return r.ok && Boolean((await r.json()).mejorar);
  } catch {
    return false;
  }
}

export async function mejorarConApi(prompt: string): Promise<string> {
  const r = await fetch("/api/mejorar", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const datos = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(datos.error || `Error ${r.status}`);
  return datos.mejorado as string;
}
