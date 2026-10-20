import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { Campo, Plantilla, TipoCampo } from "../types";
import { Boton, Etiqueta, Panel, campoClase } from "./ui";
import { claveDe } from "../lib/prompt";

interface Props {
  inicial: Plantilla;
  categorias: string[];
  onGuardar: (p: Plantilla) => void;
  onCancelar: () => void;
}

const TIPOS: { valor: TipoCampo; texto: string }[] = [
  { valor: "texto", texto: "Texto corto" },
  { valor: "parrafo", texto: "Texto largo" },
  { valor: "lista", texto: "Lista de opciones" },
];

export default function PlantillaEditor({ inicial, categorias, onGuardar, onCancelar }: Props) {
  const [p, setP] = useState<Plantilla>(inicial);
  const [error, setError] = useState("");

  const cambiar = (c: Partial<Plantilla>) => setP((prev) => ({ ...prev, ...c }));
  const cambiarCampo = (i: number, c: Partial<Campo>) =>
    setP((prev) => ({ ...prev, campos: prev.campos.map((x, j) => (j === i ? { ...x, ...c } : x)) }));
  const mover = (i: number, d: -1 | 1) =>
    setP((prev) => {
      const campos = [...prev.campos];
      const j = i + d;
      if (j < 0 || j >= campos.length) return prev;
      [campos[i], campos[j]] = [campos[j], campos[i]];
      return { ...prev, campos };
    });

  const guardar = () => {
    if (!p.nombre.trim() || !p.categoria.trim() || !p.rol.trim() || !p.tarea.trim()) {
      return setError("Nombre, categoría, rol y tarea son obligatorios.");
    }
    if (p.campos.some((c) => !c.label.trim())) return setError("Todos los campos necesitan una etiqueta.");
    // Claves únicas derivadas de la etiqueta; se conservan las existentes si no chocan.
    const usadas = new Set<string>();
    const campos = p.campos.map((c) => {
      const key = c.key && !usadas.has(c.key) ? c.key : claveDe(c.label, usadas);
      usadas.add(key);
      return { ...c, key, label: c.label.trim(), opciones: c.tipo === "lista" ? (c.opciones ?? []).filter(Boolean) : undefined };
    });
    onGuardar({ ...p, nombre: p.nombre.trim(), categoria: p.categoria.trim(), campos, propia: true });
  };

  return (
    <Panel className="space-y-4">
      <h2 className="text-base font-semibold">{inicial.nombre ? "Editar plantilla" : "Nueva plantilla"}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Etiqueta texto="Nombre *">
          <input className={campoClase} value={p.nombre} onChange={(e) => cambiar({ nombre: e.target.value })} />
        </Etiqueta>
        <Etiqueta texto="Categoría *">
          <input className={campoClase} list="categorias" value={p.categoria} onChange={(e) => cambiar({ categoria: e.target.value })} />
          <datalist id="categorias">
            {categorias.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Etiqueta>
      </div>
      <Etiqueta texto="Descripción">
        <input className={campoClase} value={p.descripcion} onChange={(e) => cambiar({ descripcion: e.target.value })} />
      </Etiqueta>
      <Etiqueta texto="Rol — «Actúa como…» *">
        <input className={campoClase} placeholder="un ingeniero de software senior" value={p.rol} onChange={(e) => cambiar({ rol: e.target.value })} />
      </Etiqueta>
      <Etiqueta texto="Tarea *">
        <textarea rows={3} className={campoClase} value={p.tarea} onChange={(e) => cambiar({ tarea: e.target.value })} />
      </Etiqueta>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Campos del formulario</h3>
        <div className="space-y-3">
          {p.campos.map((c, i) => (
            <div key={i} className="space-y-2 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <input className={campoClase} placeholder="Etiqueta del campo" aria-label="Etiqueta del campo" value={c.label} onChange={(e) => cambiarCampo(i, { label: e.target.value })} />
                <select
                  className={campoClase}
                  aria-label="Tipo de campo"
                  value={c.tipo}
                  onChange={(e) => cambiarCampo(i, { tipo: e.target.value as TipoCampo })}
                >
                  {TIPOS.map((t) => (
                    <option key={t.valor} value={t.valor}>
                      {t.texto}
                    </option>
                  ))}
                </select>
              </div>
              {c.tipo === "lista" ? (
                <input
                  className={campoClase}
                  placeholder="Opciones separadas por comas"
                  aria-label="Opciones"
                  value={(c.opciones ?? []).join(", ")}
                  onChange={(e) => cambiarCampo(i, { opciones: e.target.value.split(",").map((o) => o.trim()) })}
                />
              ) : (
                <input className={campoClase} placeholder="Texto de ayuda (opcional)" aria-label="Texto de ayuda" value={c.placeholder ?? ""} onChange={(e) => cambiarCampo(i, { placeholder: e.target.value })} />
              )}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={!!c.requerido} onChange={(e) => cambiarCampo(i, { requerido: e.target.checked })} /> Obligatorio
                </label>
                {c.tipo === "parrafo" && (
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={!!c.codigo} onChange={(e) => cambiarCampo(i, { codigo: e.target.checked })} /> Es código
                  </label>
                )}
                <span className="ml-auto flex">
                  <Boton variante="fantasma" aria-label="Subir campo" disabled={i === 0} icono={<ArrowUp size={16} />} onClick={() => mover(i, -1)} />
                  <Boton variante="fantasma" aria-label="Bajar campo" disabled={i === p.campos.length - 1} icono={<ArrowDown size={16} />} onClick={() => mover(i, 1)} />
                  <Boton variante="peligro" aria-label="Quitar campo" icono={<Trash2 size={16} />} onClick={() => setP((prev) => ({ ...prev, campos: prev.campos.filter((_, j) => j !== i) }))} />
                </span>
              </div>
            </div>
          ))}
        </div>
        <Boton className="mt-3" icono={<Plus size={16} />} onClick={() => setP((prev) => ({ ...prev, campos: [...prev.campos, { key: "", label: "", tipo: "texto" }] }))}>
          Añadir campo
        </Boton>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex gap-2">
        <Boton variante="primario" onClick={guardar}>
          Guardar plantilla
        </Boton>
        <Boton variante="fantasma" onClick={onCancelar}>
          Cancelar
        </Boton>
      </div>
    </Panel>
  );
}
