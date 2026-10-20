import type { Plantilla } from "../types";

export type Valores = Record<string, string>;

export function construirPrompt(p: Plantilla, valores: Valores): string {
  const partes = [`Actúa como ${p.rol}.`, "", `## Tarea\n${p.tarea}`];
  for (const c of p.campos) {
    const v = (valores[c.key] ?? "").trim();
    if (!v) continue;
    partes.push("", `## ${c.label}\n${c.codigo ? "```\n" + v + "\n```" : v}`);
  }
  return partes.join("\n");
}

export const hayDatos = (valores: Valores) => Object.values(valores).some((v) => v.trim());

export const faltanRequeridos = (p: Plantilla, valores: Valores) =>
  p.campos.filter((c) => c.requerido && !(valores[c.key] ?? "").trim()).map((c) => c.label);

/** Genera una clave estable para un campo a partir de su etiqueta. */
export function claveDe(label: string, usadas: Set<string>): string {
  const base =
    label
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "") || "campo";
  let clave = base;
  for (let i = 2; usadas.has(clave); i++) clave = `${base}_${i}`;
  return clave;
}
