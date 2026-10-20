import { useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Copy, Download, Search, Star, Tag, Trash2, Upload } from "lucide-react";
import type { Exportacion, Guardado, Plantilla } from "../types";
import { Boton, Chip, Panel, campoClase, cx } from "../components/ui";
import { copiar } from "../lib/clipboard";

interface Props {
  guardados: Guardado[];
  setGuardados: (f: (prev: Guardado[]) => Guardado[]) => void;
  propias: Plantilla[];
  setPropias: (f: (prev: Plantilla[]) => Plantilla[]) => void;
  avisar: (m: string) => void;
}

const formatoFecha = (t: number) => new Date(t).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" });

function unir<T extends { id: string }>(actuales: T[], nuevos: T[]): T[] {
  const ids = new Set(actuales.map((x) => x.id));
  return [...actuales, ...nuevos.filter((x) => !ids.has(x.id))];
}

export default function Guardados({ guardados, setGuardados, propias, setPropias, avisar }: Props) {
  const [busqueda, setBusqueda] = useState("");
  const [etiqueta, setEtiqueta] = useState<string | null>(null);
  const [soloFavoritos, setSoloFavoritos] = useState(false);
  const [abierto, setAbierto] = useState<string | null>(null);
  const [editandoTags, setEditandoTags] = useState<string | null>(null);
  const [tagsTexto, setTagsTexto] = useState("");
  const archivo = useRef<HTMLInputElement>(null);

  const todasEtiquetas = useMemo(() => [...new Set(guardados.flatMap((g) => g.etiquetas))].sort(), [guardados]);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return guardados
      .filter((g) => !soloFavoritos || g.favorito)
      .filter((g) => !etiqueta || g.etiquetas.includes(etiqueta))
      .filter((g) => !q || `${g.titulo} ${g.texto} ${g.plantilla} ${g.etiquetas.join(" ")}`.toLowerCase().includes(q))
      .sort((a, b) => Number(b.favorito) - Number(a.favorito) || b.fecha - a.fecha);
  }, [guardados, busqueda, etiqueta, soloFavoritos]);

  const actualizar = (id: string, cambios: Partial<Guardado>) =>
    setGuardados((prev) => prev.map((g) => (g.id === id ? { ...g, ...cambios } : g)));

  const guardarTags = (id: string) => {
    const tags = [...new Set(tagsTexto.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean))];
    actualizar(id, { etiquetas: tags });
    setEditandoTags(null);
    if (etiqueta && !tags.includes(etiqueta)) setEtiqueta(null);
  };

  const exportar = () => {
    const datos: Exportacion = { version: 1, plantillas: propias, guardados };
    const url = URL.createObjectURL(new Blob([JSON.stringify(datos, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `generador-prompts-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    avisar("Copia de seguridad exportada.");
  };

  const importar = async (file: File) => {
    try {
      const datos = JSON.parse(await file.text()) as Partial<Exportacion>;
      if (datos.version !== 1 || !Array.isArray(datos.guardados) || !Array.isArray(datos.plantillas)) {
        throw new Error("formato");
      }
      setGuardados((prev) => unir(prev, datos.guardados!));
      setPropias((prev) => unir(prev, datos.plantillas!.map((p) => ({ ...p, propia: true }))));
      avisar(`Importados ${datos.guardados.length} prompts y ${datos.plantillas.length} plantillas.`);
    } catch {
      avisar("El archivo no es una exportación válida.");
    }
  };

  return (
    <div className="space-y-4">
      <Panel>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              className={campoClase + " pl-9"}
              placeholder="Buscar en títulos, textos y etiquetas…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Boton icono={<Download size={16} />} onClick={exportar}>
              Exportar
            </Boton>
            <Boton icono={<Upload size={16} />} onClick={() => archivo.current?.click()}>
              Importar
            </Boton>
            <input
              ref={archivo}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void importar(f);
                e.target.value = "";
              }}
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Chip activo={soloFavoritos} onClick={() => setSoloFavoritos((v) => !v)}>
            ★ Favoritos
          </Chip>
          {todasEtiquetas.map((t) => (
            <Chip key={t} activo={etiqueta === t} onClick={() => setEtiqueta(etiqueta === t ? null : t)}>
              #{t}
            </Chip>
          ))}
        </div>
      </Panel>

      {guardados.length === 0 ? (
        <p className="py-10 text-center text-sm text-zinc-500">Aún no has guardado ningún prompt. Genera uno y pulsa «Guardar».</p>
      ) : visibles.length === 0 ? (
        <p className="py-10 text-center text-sm text-zinc-500">Ningún prompt coincide con el filtro.</p>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {visibles.map((g) => {
            const expandido = abierto === g.id;
            return (
              <li key={g.id}>
                <Panel className="h-full">
                  <div className="flex items-start gap-2">
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() => setAbierto(expandido ? null : g.id)}
                      aria-expanded={expandido}
                    >
                      <h3 className="truncate font-medium">{g.titulo}</h3>
                      <p className="text-xs text-zinc-500">
                        {g.plantilla} · {formatoFecha(g.fecha)}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => actualizar(g.id, { favorito: !g.favorito })}
                      aria-label={g.favorito ? "Quitar de favoritos" : "Marcar como favorito"}
                      aria-pressed={g.favorito}
                      className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Star size={18} className={cx(g.favorito && "fill-amber-400 text-amber-400")} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setAbierto(expandido ? null : g.id)}
                      aria-label={expandido ? "Contraer" : "Expandir"}
                      className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      {expandido ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>

                  {g.etiquetas.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {g.etiquetas.map((t) => (
                        <span key={t} className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  <pre
                    className={cx(
                      "mt-3 whitespace-pre-wrap break-words rounded-lg bg-zinc-50 p-3 font-mono text-[13px] leading-relaxed dark:bg-zinc-950",
                      !expandido && "line-clamp-3",
                    )}
                  >
                    {g.texto}
                  </pre>

                  {editandoTags === g.id ? (
                    <div className="mt-3 flex gap-2">
                      <input className={campoClase} value={tagsTexto} onChange={(e) => setTagsTexto(e.target.value)} placeholder="etiquetas, separadas, por comas" />
                      <Boton variante="primario" onClick={() => guardarTags(g.id)}>
                        OK
                      </Boton>
                    </div>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Boton
                        icono={<Copy size={16} />}
                        onClick={async () => avisar((await copiar(g.texto)) ? "Copiado al portapapeles." : "No se pudo copiar.")}
                      >
                        Copiar
                      </Boton>
                      <Boton
                        variante="fantasma"
                        icono={<Tag size={16} />}
                        onClick={() => {
                          setEditandoTags(g.id);
                          setTagsTexto(g.etiquetas.join(", "));
                        }}
                      >
                        Etiquetas
                      </Boton>
                      <Boton
                        variante="peligro"
                        className="ml-auto"
                        icono={<Trash2 size={16} />}
                        aria-label={`Borrar ${g.titulo}`}
                        onClick={() => {
                          if (confirm(`¿Borrar «${g.titulo}»?`)) setGuardados((prev) => prev.filter((x) => x.id !== g.id));
                        }}
                      />
                    </div>
                  )}
                </Panel>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
