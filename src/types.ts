export type TipoCampo = "texto" | "parrafo" | "lista";

export interface Campo {
  key: string;
  label: string;
  tipo: TipoCampo;
  requerido?: boolean;
  placeholder?: string;
  opciones?: string[]; // solo para tipo "lista"
  codigo?: boolean; // se inserta dentro de un bloque ```
}

export interface Plantilla {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  rol: string;
  tarea: string;
  campos: Campo[];
  propia?: boolean;
}

export interface Guardado {
  id: string;
  titulo: string;
  texto: string;
  plantilla: string;
  etiquetas: string[];
  favorito: boolean;
  fecha: number;
}

export interface Exportacion {
  version: 1;
  plantillas: Plantilla[];
  guardados: Guardado[];
}
