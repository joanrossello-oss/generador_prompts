export async function copiar(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    // Alternativa para http en red local (iPhone), donde la API moderna no está disponible.
    const t = document.createElement("textarea");
    t.value = texto;
    t.style.position = "fixed";
    t.style.opacity = "0";
    document.body.append(t);
    t.select();
    t.setSelectionRange(0, texto.length);
    const ok = document.execCommand("copy");
    t.remove();
    return ok;
  }
}
