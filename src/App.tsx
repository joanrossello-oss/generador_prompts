import { useEffect, useState } from "react";
import { Bookmark, LayoutTemplate, Moon, Sparkles, Sun, Terminal } from "lucide-react";
import type { Guardado, Plantilla } from "./types";
import { PLANTILLAS_BASE } from "./data/plantillas";
import { useAlmacen, useEstado } from "./lib/storage";
import { apiDisponible } from "./lib/mejorar";
import { cx } from "./components/ui";
import Generar from "./views/Generar";
import Guardados from "./views/Guardados";
import Plantillas from "./views/Plantillas";

type Vista = "generar" | "guardados" | "plantillas";

const PESTANAS = [
  { id: "generar", texto: "Generar", icono: Sparkles },
  { id: "guardados", texto: "Guardados", icono: Bookmark },
  { id: "plantillas", texto: "Plantillas", icono: LayoutTemplate },
] as const;

type Tema = "sistema" | "claro" | "oscuro";

function useTema() {
  const [tema, setTema] = useAlmacen<Tema>("gp.tema", "sistema");
  useEffect(() => {
    const aplicar = () => {
      const oscuro = tema === "oscuro" || (tema === "sistema" && matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("dark", oscuro);
    };
    aplicar();
    const mq = matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", aplicar);
    return () => mq.removeEventListener("change", aplicar);
  }, [tema]);
  return [tema, setTema] as const;
}

export default function App() {
  const [vista, setVista] = useState<Vista>("generar");
  const [propias, setPropias] = useAlmacen<Plantilla[]>("gp.plantillas", []);
  const [guardados, setGuardados] = useAlmacen<Guardado[]>("gp.guardados", []);
  const [apiOk, setApiOk] = useState(false);
  const [mensaje, avisar] = useEstado();
  const [tema, setTema] = useTema();

  useEffect(() => {
    void apiDisponible().then(setApiOk);
  }, []);

  const plantillas = [...PLANTILLAS_BASE, ...propias];
  const oscuro = document.documentElement.classList.contains("dark");

  return (
    <div className="mx-auto min-h-dvh max-w-6xl pb-28 md:pb-10">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-zinc-50/85 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/85" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-white">
            <Terminal size={18} />
          </span>
          <h1 className="text-base font-semibold">Generador de Prompts</h1>

          <nav className="ml-6 hidden gap-1 md:flex" aria-label="Secciones">
            {PESTANAS.map(({ id, texto, icono: Icono }) => (
              <button
                key={id}
                type="button"
                onClick={() => setVista(id)}
                aria-current={vista === id ? "page" : undefined}
                className={cx(
                  "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium",
                  vista === id ? "bg-zinc-200/70 dark:bg-zinc-800" : "text-zinc-500 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/60",
                )}
              >
                <Icono size={16} /> {texto}
              </button>
            ))}
          </nav>

          <button
            type="button"
            className="ml-auto rounded-lg p-2 text-zinc-500 hover:bg-zinc-200/60 dark:hover:bg-zinc-800"
            aria-label={`Tema: ${tema}. Cambiar tema`}
            onClick={() => setTema(tema === "sistema" ? (oscuro ? "claro" : "oscuro") : tema === "claro" ? "oscuro" : "claro")}
          >
            {oscuro ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <main className="px-4 py-5">
        <div hidden={vista !== "generar"}>
          <Generar plantillas={plantillas} apiOk={apiOk} avisar={avisar} onGuardar={(g) => setGuardados((prev) => [g, ...prev])} />
        </div>
        <div hidden={vista !== "guardados"}>
          <Guardados guardados={guardados} setGuardados={setGuardados} propias={propias} setPropias={setPropias} avisar={avisar} />
        </div>
        <div hidden={vista !== "plantillas"}>
          <Plantillas plantillas={plantillas} setPropias={setPropias} avisar={avisar} />
        </div>
      </main>

      {mensaje && (
        <div role="status" className="fixed inset-x-4 bottom-24 z-30 mx-auto w-fit max-w-[calc(100%-2rem)] rounded-full bg-zinc-900 px-4 py-2 text-sm text-white shadow-lg md:bottom-6 dark:bg-zinc-100 dark:text-zinc-900">
          {mensaje}
        </div>
      )}

      <nav
        aria-label="Secciones"
        className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 border-t border-zinc-200 bg-white/90 backdrop-blur md:hidden dark:border-zinc-800 dark:bg-zinc-950/90"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {PESTANAS.map(({ id, texto, icono: Icono }) => (
          <button
            key={id}
            type="button"
            onClick={() => setVista(id)}
            aria-current={vista === id ? "page" : undefined}
            className={cx("flex flex-col items-center gap-1 py-2.5 text-xs font-medium", vista === id ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-500")}
          >
            <Icono size={20} />
            {texto}
          </button>
        ))}
      </nav>
    </div>
  );
}
