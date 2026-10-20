import { useState } from "react";
import { Copy, Pencil, Plus, Trash2 } from "lucide-react";
import type { Plantilla } from "../types";
import { Boton, Panel } from "../components/ui";
import PlantillaEditor from "../components/PlantillaEditor";
import { nuevoId } from "../lib/storage";

interface Props {
  plantillas: Plantilla[];
  setPropias: (f: (prev: Plantilla[]) => Plantilla[]) => void;
  avisar: (m: string) => void;
}

const vacia = (): Plantilla => ({
  id: nuevoId(), nombre: "", categoria: "", descripcion: "", rol: "", tarea: "", propia: true,
  campos: [{ key: "", label: "", tipo: "parrafo", requerido: true }],
});

export default function Plantillas({ plantillas, setPropias, avisar }: Props) {
  const [editando, setEditando] = useState<Plantilla | null>(null);
  const categorias = [...new Set(plantillas.map((p) => p.categoria))];

  if (editando) {
    return (
      <PlantillaEditor
        inicial={editando}
        categorias={categorias}
        onCancelar={() => setEditando(null)}
        onGuardar={(p) => {
          setPropias((prev) => (prev.some((x) => x.id === p.id) ? prev.map((x) => (x.id === p.id ? p : x)) : [...prev, p]));
          setEditando(null);
          avisar("Plantilla guardada.");
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">Las plantillas base no se pueden modificar, pero puedes duplicarlas y adaptarlas.</p>
        <Boton variante="primario" icono={<Plus size={16} />} onClick={() => setEditando(vacia())}>
          Nueva
        </Boton>
      </div>

      {categorias.map((c) => (
        <div key={c}>
          <h2 className="mb-2 text-sm font-semibold text-zinc-500">{c}</h2>
          <ul className="grid gap-3 lg:grid-cols-2">
            {plantillas
              .filter((p) => p.categoria === c)
              .map((p) => (
                <li key={p.id}>
                  <Panel className="flex h-full flex-col gap-3">
                    <div>
                      <h3 className="font-medium">
                        {p.nombre}
                        {p.propia && <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">propia</span>}
                      </h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">{p.descripcion}</p>
                      <p className="mt-1 text-xs text-zinc-400">{p.campos.length} campos</p>
                    </div>
                    <div className="mt-auto flex gap-2">
                      {p.propia ? (
                        <>
                          <Boton icono={<Pencil size={16} />} onClick={() => setEditando(p)}>
                            Editar
                          </Boton>
                          <Boton
                            variante="peligro"
                            aria-label={`Borrar ${p.nombre}`}
                            icono={<Trash2 size={16} />}
                            onClick={() => {
                              if (confirm(`¿Borrar la plantilla «${p.nombre}»?`)) setPropias((prev) => prev.filter((x) => x.id !== p.id));
                            }}
                          />
                        </>
                      ) : (
                        <Boton
                          icono={<Copy size={16} />}
                          onClick={() => setEditando({ ...structuredClone(p), id: nuevoId(), nombre: `${p.nombre} (copia)`, propia: true })}
                        >
                          Duplicar y editar
                        </Boton>
                      )}
                    </div>
                  </Panel>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
