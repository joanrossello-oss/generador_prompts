import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Save, Sparkles, Undo2, Wand2 } from "lucide-react";
import type { Guardado, Plantilla } from "../types";
import { Boton, Chip, Etiqueta, Panel, campoClase } from "../components/ui";
import { construirPrompt, faltanRequeridos, hayDatos, type Valores } from "../lib/prompt";
import { copiar } from "../lib/clipboard";
import { mejorarConApi, paraMejorar } from "../lib/mejorar";
import { nuevoId } from "../lib/storage";

interface Props {
  plantillas: Plantilla[];
  apiOk: boolean;
  onGuardar: (g: Guardado) => void;
  avisar: (m: string) => void;
}

export default function Generar({ plantillas, apiOk, onGuardar, avisar }: Props) {
  const categorias = useMemo(() => [...new Set(plantillas.map((p) => p.categoria))], [plantillas]);
  const [categoria, setCategoria] = useState(categorias[0] ?? "");
  const [plantillaId, setPlantillaId] = useState(plantillas[0]?.id ?? "");
  const [valores, setValores] = useState<Valores>({});
  const [editado, setEditado] = useState<string | null>(null); // texto modificado a mano o por la API
  const [previo, setPrevio] = useState<string | null>(null);
  const [mejorando, setMejorando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [etiquetas, setEtiquetas] = useState("");

  const delaCategoria = plantillas.filter((p) => p.categoria === categoria);
  const plantilla = plantillas.find((p) => p.id === plantillaId) ?? delaCategoria[0] ?? plantillas[0];

  // Si se borra la plantilla seleccionada o su categoría, se vuelve a una válida.
  useEffect(() => {
    if (plantilla && plantilla.id !== plantillaId) setPlantillaId(plantilla.id);
    if (plantilla && plantilla.categoria !== categoria) setCategoria(plantilla.categoria);
  }, [plantilla, plantillaId, categoria]);

  if (!plantilla) return <Panel>No hay plantillas. Crea una en la pestaña Plantillas.</Panel>;

  const generado = hayDatos(valores) ? construirPrompt(plantilla, valores) : "";
  const texto = editado ?? generado;
  const faltan = faltanRequeridos(plantilla, valores);

  const cambiarValor = (key: string, v: string) => {
    setValores((prev) => ({ ...prev, [key]: v }));
    setEditado(null);
    setPrevio(null);
  };

  const elegirCategoria = (c: string) => {
    setCategoria(c);
    elegirPlantilla(plantillas.find((p) => p.categoria === c)?.id ?? "");
  };
  const elegirPlantilla = (id: string) => {
    setPlantillaId(id);
    setValores({});
    setEditado(null);
    setPrevio(null);
    setGuardando(false);
  };

  const copiarTexto = async (t: string, mensaje: string) => {
    if (!t.trim()) return avisar("Rellena la plantilla antes de copiar.");
    avisar((await copiar(t)) ? mensaje : "No se pudo copiar.");
  };

  const mejorar = async () => {
    if (!texto.trim()) return avisar("Rellena la plantilla antes de mejorar.");
    setMejorando(true);
    try {
      const mejorado = await mejorarConApi(texto);
      setPrevio(texto);
      setEditado(mejorado);
      avisar("Prompt mejorado. Puedes deshacer el cambio.");
    } catch (e) {
      avisar(e instanceof Error ? e.message : "No se pudo mejorar el prompt.");
    } finally {
      setMejorando(false);
    }
  };

  const abrirGuardar = () => {
    if (!texto.trim()) return avisar("Rellena la plantilla antes de guardar.");
    setTitulo(plantilla.nombre);
    setEtiquetas("");
    setGuardando(true);
  };

  const confirmarGuardar = () => {
    onGuardar({
      id: nuevoId(),
      titulo: titulo.trim() || plantilla.nombre,
      texto,
      plantilla: plantilla.nombre,
      etiquetas: [...new Set(etiquetas.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean))],
      favorito: false,
      fecha: Date.now(),
    });
    setGuardando(false);
    avisar("Guardado.");
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
      <Panel>
        <h2 className="mb-3 text-sm font-semibold">1. Plantilla</h2>
        <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Categorías">
          {categorias.map((c) => (
            <Chip key={c} activo={c === categoria} onClick={() => elegirCategoria(c)}>
              {c}
            </Chip>
          ))}
        </div>
        <Etiqueta texto="Tipo de prompt">
          <select className={campoClase} value={plantilla.id} onChange={(e) => elegirPlantilla(e.target.value)}>
            {delaCategoria.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </Etiqueta>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{plantilla.descripcion}</p>

        <h2 className="mb-3 mt-6 text-sm font-semibold">2. Rellena los datos</h2>
        <form className="space-y-3" onSubmit={(e) => e.preventDefault()} autoComplete="off">
          {plantilla.campos.map((c) => (
            <Etiqueta key={c.key} texto={c.label + (c.requerido ? " *" : "")}>
              {c.tipo === "parrafo" ? (
                <textarea
                  rows={c.codigo ? 6 : 3}
                  className={campoClase + (c.codigo ? " font-mono" : "")}
                  placeholder={c.placeholder}
                  value={valores[c.key] ?? ""}
                  onChange={(e) => cambiarValor(c.key, e.target.value)}
                />
              ) : c.tipo === "lista" ? (
                <select className={campoClase} value={valores[c.key] ?? ""} onChange={(e) => cambiarValor(c.key, e.target.value)}>
                  <option value="">— sin especificar —</option>
                  {(c.opciones ?? []).map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  className={campoClase}
                  placeholder={c.placeholder}
                  value={valores[c.key] ?? ""}
                  onChange={(e) => cambiarValor(c.key, e.target.value)}
                />
              )}
            </Etiqueta>
          ))}
        </form>
        <Boton variante="fantasma" className="mt-3" onClick={() => elegirPlantilla(plantilla.id)}>
          Limpiar campos
        </Boton>
      </Panel>

      <Panel className="lg:sticky lg:top-20">
        <h2 className="mb-3 text-sm font-semibold">3. Tu prompt</h2>
        <textarea
          rows={14}
          className={campoClase + " font-mono !text-[13px] leading-relaxed"}
          placeholder="Aquí aparecerá tu prompt a medida que rellenes los campos…"
          value={texto}
          onChange={(e) => setEditado(e.target.value)}
          aria-label="Prompt generado"
        />
        {texto && faltan.length > 0 && (
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">Faltan campos obligatorios: {faltan.join(", ")}.</p>
        )}

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Boton variante="primario" icono={<Copy size={16} />} onClick={() => copiarTexto(texto, "Copiado al portapapeles.")}>
            Copiar
          </Boton>
          <Boton icono={<Save size={16} />} onClick={abrirGuardar}>
            Guardar
          </Boton>
          <Boton
            variante="acento"
            className="col-span-2"
            icono={<Sparkles size={16} />}
            onClick={() => copiarTexto(texto && paraMejorar(texto), "Copiado. Pégalo en Claude para obtener la versión mejorada.")}
          >
            Copiar para mejorar en Claude
          </Boton>
          {apiOk && (
            <Boton variante="acento" icono={<Wand2 size={16} />} disabled={mejorando} onClick={mejorar}>
              {mejorando ? "Mejorando…" : "Mejorar con API"}
            </Boton>
          )}
          {previo !== null && (
            <Boton
              icono={<Undo2 size={16} />}
              onClick={() => {
                setEditado(previo);
                setPrevio(null);
              }}
            >
              Deshacer
            </Boton>
          )}
        </div>

        {guardando && (
          <div className="mt-4 space-y-3 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
            <Etiqueta texto="Título">
              <input className={campoClase} value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            </Etiqueta>
            <Etiqueta texto="Etiquetas (separadas por comas)">
              <input className={campoClase} placeholder="react, cliente-x" value={etiquetas} onChange={(e) => setEtiquetas(e.target.value)} />
            </Etiqueta>
            <div className="flex gap-2">
              <Boton variante="primario" icono={<Check size={16} />} onClick={confirmarGuardar}>
                Guardar prompt
              </Boton>
              <Boton variante="fantasma" onClick={() => setGuardando(false)}>
                Cancelar
              </Boton>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}
