import type { Campo, Plantilla } from "../types";

const FORMATOS = [
  "Lista con viñetas",
  "Pasos numerados",
  "Tabla en markdown",
  "Bloque de código con breve explicación",
  "Respuesta breve y directa (máx. 5 líneas)",
  "JSON válido",
];

const formato: Campo = { key: "formato", label: "Formato de salida", tipo: "lista", opciones: FORMATOS };
const lenguaje: Campo = { key: "lenguaje", label: "Lenguaje / stack", tipo: "texto", placeholder: "Ej: TypeScript, React 18, Node 20" };
const codigo = (label: string, requerido = true): Campo => ({ key: "codigo", label, tipo: "parrafo", requerido, codigo: true });

export const PLANTILLAS_BASE: Plantilla[] = [
  {
    id: "depurar", categoria: "Programación", nombre: "Depurar un error",
    descripcion: "Diagnostica la causa de un fallo y propone la corrección.",
    rol: "un ingeniero de software senior experto en depuración",
    tarea: "Encuentra la causa raíz del error descrito y propón una corrección.",
    campos: [
      lenguaje,
      { key: "error", label: "Error o mensaje", tipo: "parrafo", requerido: true, placeholder: "Pega el stack trace o describe el comportamiento incorrecto" },
      { key: "codigo", label: "Código relacionado", tipo: "parrafo", codigo: true, placeholder: "Pega el código relevante" },
      { key: "esperado", label: "Comportamiento esperado", tipo: "texto" },
      { key: "intentado", label: "Qué has probado ya", tipo: "parrafo" },
      formato,
    ],
  },
  {
    id: "revisar", categoria: "Programación", nombre: "Revisar código",
    descripcion: "Code review enfocado en bugs, seguridad y mantenibilidad.",
    rol: "un revisor de código exigente y constructivo",
    tarea: "Revisa el código y señala problemas ordenados por gravedad, con una sugerencia concreta para cada uno.",
    campos: [
      lenguaje,
      codigo("Código a revisar"),
      { key: "enfoque", label: "Enfoque", tipo: "texto", placeholder: "Ej: seguridad, rendimiento, legibilidad" },
      formato,
    ],
  },
  {
    id: "funcion", categoria: "Programación", nombre: "Escribir función o feature",
    descripcion: "Genera código nuevo a partir de requisitos claros.",
    rol: "un desarrollador senior que escribe código limpio y probado",
    tarea: "Implementa lo que se pide siguiendo las convenciones indicadas.",
    campos: [
      lenguaje,
      { key: "requisito", label: "Qué debe hacer", tipo: "parrafo", requerido: true },
      { key: "entradas", label: "Entradas y salidas", tipo: "parrafo", placeholder: "Parámetros, tipos, valor devuelto" },
      { key: "restricciones", label: "Restricciones", tipo: "parrafo", placeholder: "Sin dependencias externas, estilo del proyecto…" },
      formato,
    ],
  },
  {
    id: "refactor", categoria: "Programación", nombre: "Refactorizar",
    descripcion: "Mejora la estructura sin cambiar el comportamiento.",
    rol: "un ingeniero experto en refactorización",
    tarea: "Refactoriza el código para mejorar su claridad y mantenibilidad sin cambiar su comportamiento. Explica los cambios clave.",
    campos: [
      lenguaje,
      codigo("Código a refactorizar"),
      { key: "objetivo", label: "Objetivo", tipo: "texto", placeholder: "Ej: reducir duplicación, separar responsabilidades" },
      formato,
    ],
  },
  {
    id: "tests", categoria: "Programación", nombre: "Escribir tests",
    descripcion: "Crea tests que cubran casos normales y límite.",
    rol: "un ingeniero de calidad especializado en testing automatizado",
    tarea: "Escribe tests para el código dado, cubriendo casos normales, casos límite y errores.",
    campos: [
      lenguaje,
      { key: "framework", label: "Framework de tests", tipo: "texto", placeholder: "Ej: Jest, pytest, XCTest" },
      codigo("Código a testear"),
      formato,
    ],
  },
  {
    id: "explicar", categoria: "Programación", nombre: "Explicar código",
    descripcion: "Explica qué hace un fragmento y por qué.",
    rol: "un mentor técnico que explica con claridad",
    tarea: "Explica qué hace el código, cómo fluye la ejecución y qué puntos requieren atención.",
    campos: [
      lenguaje,
      codigo("Código"),
      { key: "nivel", label: "Mi nivel", tipo: "lista", opciones: ["Principiante", "Intermedio", "Avanzado"] },
      formato,
    ],
  },
  {
    id: "email", categoria: "Trabajo", nombre: "Redactar email",
    descripcion: "Escribe un email profesional claro y con el tono adecuado.",
    rol: "un profesional con excelente comunicación escrita",
    tarea: "Redacta un email con asunto y cuerpo, listo para enviar.",
    campos: [
      { key: "destinatario", label: "Destinatario", tipo: "texto", placeholder: "Ej: mi jefa, un cliente, el equipo" },
      { key: "objetivo", label: "Objetivo del email", tipo: "parrafo", requerido: true },
      { key: "puntos", label: "Puntos que debe incluir", tipo: "parrafo" },
      { key: "tono", label: "Tono", tipo: "lista", opciones: ["Formal", "Cercano y profesional", "Directo y breve", "Diplomático"] },
    ],
  },
  {
    id: "resumen", categoria: "Trabajo", nombre: "Resumir texto o reunión",
    descripcion: "Extrae lo importante: decisiones, tareas y pendientes.",
    rol: "un asistente ejecutivo experto en síntesis",
    tarea: "Resume el contenido destacando decisiones, acciones asignadas (con responsable si aparece) y puntos pendientes.",
    campos: [
      { key: "texto", label: "Texto o notas", tipo: "parrafo", requerido: true },
      { key: "longitud", label: "Longitud deseada", tipo: "texto", placeholder: "Ej: 5 viñetas, un párrafo" },
      formato,
    ],
  },
  {
    id: "plan", categoria: "Trabajo", nombre: "Plan de proyecto o tareas",
    descripcion: "Divide un objetivo en pasos, riesgos y prioridades.",
    rol: "un project manager con experiencia en entrega de software",
    tarea: "Crea un plan con fases, tareas priorizadas, dependencias y riesgos principales.",
    campos: [
      { key: "objetivo", label: "Objetivo", tipo: "parrafo", requerido: true },
      { key: "plazo", label: "Plazo", tipo: "texto", placeholder: "Ej: 3 semanas" },
      { key: "recursos", label: "Recursos / equipo", tipo: "texto" },
      { key: "restricciones", label: "Restricciones", tipo: "parrafo" },
      formato,
    ],
  },
  {
    id: "docs", categoria: "Trabajo", nombre: "Documentación técnica",
    descripcion: "Redacta documentación clara para otras personas.",
    rol: "un redactor técnico",
    tarea: "Escribe documentación clara y bien estructurada para el tema indicado.",
    campos: [
      { key: "tema", label: "Qué documentar", tipo: "parrafo", requerido: true },
      { key: "audiencia", label: "Audiencia", tipo: "texto", placeholder: "Ej: desarrolladores nuevos, soporte, clientes" },
      { key: "material", label: "Material de partida", tipo: "parrafo", placeholder: "Código, notas, enlaces…" },
      formato,
    ],
  },
];
