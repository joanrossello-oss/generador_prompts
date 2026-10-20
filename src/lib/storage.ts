import { useCallback, useEffect, useState } from "react";

function leer<T>(clave: string, inicial: T): T {
  try {
    const crudo = localStorage.getItem(clave);
    return crudo ? (JSON.parse(crudo) as T) : inicial;
  } catch {
    return inicial;
  }
}

/** Estado persistido en localStorage; si el navegador lo bloquea, funciona solo en memoria. */
export function useAlmacen<T>(clave: string, inicial: T) {
  const [valor, setValor] = useState<T>(() => leer(clave, inicial));

  useEffect(() => {
    try {
      localStorage.setItem(clave, JSON.stringify(valor));
    } catch {
      /* sin almacenamiento disponible */
    }
  }, [clave, valor]);

  return [valor, setValor] as const;
}

export const nuevoId = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));

export function useEstado() {
  const [mensaje, setMensaje] = useState("");
  useEffect(() => {
    if (!mensaje) return;
    const t = setTimeout(() => setMensaje(""), 3000);
    return () => clearTimeout(t);
  }, [mensaje]);
  return [mensaje, useCallback((m: string) => setMensaje(m), [])] as const;
}
