"use strict";

const FORMATOS = [
  "",
  "Lista con viñetas",
  "Pasos numerados",
  "Tabla en markdown",
  "Bloque de código con breve explicación",
  "Respuesta breve y directa (máx. 5 líneas)",
  "JSON válido",
];

const formato = { key: "formato", label: "Formato de salida", type: "select", options: FORMATOS };
const lenguaje = { key: "lenguaje", label: "Lenguaje / stack", type: "text", placeholder: "Ej: TypeScript, React 18, Node 20" };

const CATEGORIAS = {
  Programación: [
    {
      id: "depurar",
      nombre: "Depurar un error",
      descripcion: "Diagnostica la causa de un fallo y propone la corrección.",
      rol: "un ingeniero de software senior experto en depuración",
      tarea: "Encuentra la causa raíz del error descrito y propón una corrección.",
      campos: [
        lenguaje,
        { key: "error", label: "Error o mensaje", type: "textarea", required: true, placeholder: "Pega el stack trace o describe el comportamiento incorrecto" },
        { key: "codigo", label: "Código relacionado", type: "textarea", placeholder: "Pega el código relevante" },
        { key: "esperado", label: "Comportamiento esperado", type: "text" },
        { key: "intentado", label: "Qué has probado ya", type: "textarea" },
        formato,
      ],
    },
    {
      id: "revisar",
      nombre: "Revisar código",
      descripcion: "Code review enfocado en bugs, seguridad y mantenibilidad.",
      rol: "un revisor de código exigente y constructivo",
      tarea: "Revisa el código y señala problemas ordenados por gravedad, con una sugerencia concreta para cada uno.",
      campos: [
        lenguaje,
        { key: "codigo", label: "Código a revisar", type: "textarea", required: true },
        { key: "enfoque", label: "Enfoque", type: "text", placeholder: "Ej: seguridad, rendimiento, legibilidad" },
        formato,
      ],
    },
    {
      id: "funcion",
      nombre: "Escribir función o feature",
      descripcion: "Genera código nuevo a partir de requisitos claros.",
      rol: "un desarrollador senior que escribe código limpio y probado",
      tarea: "Implementa lo que se pide siguiendo las convenciones indicadas.",
      campos: [
        lenguaje,
        { key: "requisito", label: "Qué debe hacer", type: "textarea", required: true },
        { key: "entradas", label: "Entradas y salidas", type: "textarea", placeholder: "Parámetros, tipos, valor devuelto" },
        { key: "restricciones", label: "Restricciones", type: "textarea", placeholder: "Sin dependencias externas, estilo del proyecto…" },
        formato,
      ],
    },
    {
      id: "refactor",
      nombre: "Refactorizar",
      descripcion: "Mejora la estructura sin cambiar el comportamiento.",
      rol: "un ingeniero experto en refactorización",
      tarea: "Refactoriza el código para mejorar su claridad y mantenibilidad sin cambiar su comportamiento. Explica los cambios clave.",
      campos: [
        lenguaje,
        { key: "codigo", label: "Código a refactorizar", type: "textarea", required: true },
        { key: "objetivo", label: "Objetivo", type: "text", placeholder: "Ej: reducir duplicación, separar responsabilidades" },
        formato,
      ],
    },
    {
      id: "tests",
      nombre: "Escribir tests",
      descripcion: "Crea tests que cubran casos normales y límite.",
      rol: "un ingeniero de calidad especializado en testing automatizado",
      tarea: "Escribe tests para el código dado, cubriendo casos normales, casos límite y errores.",
      campos: [
        lenguaje,
        { key: "framework", label: "Framework de tests", type: "text", placeholder: "Ej: Jest, pytest, XCTest" },
        { key: "codigo", label: "Código a testear", type: "textarea", required: true },
        formato,
      ],
    },
    {
      id: "explicar",
      nombre: "Explicar código",
      descripcion: "Explica qué hace un fragmento y por qué.",
      rol: "un mentor técnico que explica con claridad",
      tarea: "Explica qué hace el código, cómo fluye la ejecución y qué puntos requieren atención.",
      campos: [
        lenguaje,
        { key: "codigo", label: "Código", type: "textarea", required: true },
        { key: "nivel", label: "Mi nivel", type: "select", options: ["", "Principiante", "Intermedio", "Avanzado"] },
        formato,
      ],
    },
  ],

  Trabajo: [
    {
      id: "email",
      nombre: "Redactar email",
      descripcion: "Escribe un email profesional claro y con el tono adecuado.",
      rol: "un profesional con excelente comunicación escrita",
      tarea: "Redacta un email con asunto y cuerpo, listo para enviar.",
      campos: [
        { key: "destinatario", label: "Destinatario", type: "text", placeholder: "Ej: mi jefa, un cliente, el equipo" },
        { key: "objetivo", label: "Objetivo del email", type: "textarea", required: true },
        { key: "puntos", label: "Puntos que debe incluir", type: "textarea" },
        { key: "tono", label: "Tono", type: "select", options: ["", "Formal", "Cercano y profesional", "Directo y breve", "Diplomático"] },
      ],
    },
    {
      id: "resumen",
      nombre: "Resumir texto o reunión",
      descripcion: "Extrae lo importante: decisiones, tareas y pendientes.",
      rol: "un asistente ejecutivo experto en síntesis",
      tarea: "Resume el contenido destacando decisiones, acciones asignadas (con responsable si aparece) y puntos pendientes.",
      campos: [
        { key: "texto", label: "Texto o notas", type: "textarea", required: true },
        { key: "longitud", label: "Longitud deseada", type: "text", placeholder: "Ej: 5 viñetas, un párrafo" },
        formato,
      ],
    },
    {
      id: "plan",
      nombre: "Plan de proyecto o tareas",
      descripcion: "Divide un objetivo en pasos, riesgos y prioridades.",
      rol: "un project manager con experiencia en entrega de software",
      tarea: "Crea un plan con fases, tareas priorizadas, dependencias y riesgos principales.",
      campos: [
        { key: "objetivo", label: "Objetivo", type: "textarea", required: true },
        { key: "plazo", label: "Plazo", type: "text", placeholder: "Ej: 3 semanas" },
        { key: "recursos", label: "Recursos / equipo", type: "text" },
        { key: "restricciones", label: "Restricciones", type: "textarea" },
        formato,
      ],
    },
    {
      id: "docs",
      nombre: "Documentación técnica",
      descripcion: "Redacta documentación clara para otras personas.",
      rol: "un redactor técnico",
      tarea: "Escribe documentación clara y bien estructurada para el tema indicado.",
      campos: [
        { key: "tema", label: "Qué documentar", type: "textarea", required: true },
        { key: "audiencia", label: "Audiencia", type: "text", placeholder: "Ej: desarrolladores nuevos, soporte, clientes" },
        { key: "material", label: "Material de partida", type: "textarea", placeholder: "Código, notas, enlaces…" },
        formato,
      ],
    },
  ],
};

const GUARDADOS_KEY = "generador_prompts.guardados";

const $ = (id) => document.getElementById(id);
const el = {
  categorias: $("categorias"),
  plantilla: $("plantilla"),
  descripcion: $("descripcion"),
  formulario: $("formulario"),
  resultado: $("resultado"),
  estado: $("estado"),
  guardados: $("guardados"),
  sinGuardados: $("sinGuardados"),
};

let categoriaActual = Object.keys(CATEGORIAS)[0];
let plantillaActual = CATEGORIAS[categoriaActual][0];

function renderCategorias() {
  el.categorias.innerHTML = "";
  for (const nombre of Object.keys(CATEGORIAS)) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.role = "tab";
    b.textContent = nombre;
    b.setAttribute("aria-selected", String(nombre === categoriaActual));
    b.addEventListener("click", () => {
      categoriaActual = nombre;
      plantillaActual = CATEGORIAS[nombre][0];
      renderTodo();
    });
    el.categorias.append(b);
  }
}

function renderPlantillas() {
  el.plantilla.innerHTML = "";
  for (const p of CATEGORIAS[categoriaActual]) {
    el.plantilla.append(new Option(p.nombre, p.id, false, p.id === plantillaActual.id));
  }
  el.descripcion.textContent = plantillaActual.descripcion;
}

function renderFormulario() {
  el.formulario.innerHTML = "";
  for (const c of plantillaActual.campos) {
    const label = document.createElement("label");
    label.className = "field";
    const span = document.createElement("span");
    span.textContent = c.label + (c.required ? " *" : "");
    let input;
    if (c.type === "textarea") {
      input = document.createElement("textarea");
      input.rows = 4;
    } else if (c.type === "select") {
      input = document.createElement("select");
      for (const o of c.options) input.append(new Option(o || "— sin especificar —", o));
    } else {
      input = document.createElement("input");
      input.type = "text";
    }
    input.name = c.key;
    if (c.placeholder) input.placeholder = c.placeholder;
    input.addEventListener("input", actualizarResultado);
    label.append(span, input);
    el.formulario.append(label);
  }
}

function construirPrompt() {
  const p = plantillaActual;
  const valores = Object.fromEntries(new FormData(el.formulario));
  const partes = [`Actúa como ${p.rol}.`, "", `## Tarea\n${p.tarea}`];
  for (const c of p.campos) {
    const v = (valores[c.key] || "").trim();
    if (!v) continue;
    const bloque = c.key === "codigo" ? "```\n" + v + "\n```" : v;
    partes.push("", `## ${c.label}\n${bloque}`);
  }
  return partes.join("\n");
}

function actualizarResultado() {
  const hayDatos = [...new FormData(el.formulario).values()].some((v) => String(v).trim());
  el.resultado.value = hayDatos ? construirPrompt() : "";
  el.estado.textContent = "";
}

function mostrarEstado(msg) {
  el.estado.textContent = msg;
  setTimeout(() => { if (el.estado.textContent === msg) el.estado.textContent = ""; }, 2500);
}

async function copiar() {
  const texto = el.resultado.value;
  if (!texto) return mostrarEstado("No hay nada que copiar todavía.");
  try {
    await navigator.clipboard.writeText(texto);
  } catch {
    // Alternativa para http en red local (iPhone) donde clipboard API no está disponible
    el.resultado.select();
    el.resultado.setSelectionRange(0, texto.length);
    document.execCommand("copy");
  }
  mostrarEstado("Copiado al portapapeles.");
}

function leerGuardados() {
  try { return JSON.parse(localStorage.getItem(GUARDADOS_KEY)) || []; } catch { return []; }
}
function escribirGuardados(lista) {
  try { localStorage.setItem(GUARDADOS_KEY, JSON.stringify(lista)); } catch { mostrarEstado("No se pudo guardar."); }
}

function guardar() {
  const texto = el.resultado.value.trim();
  if (!texto) return mostrarEstado("Rellena la plantilla antes de guardar.");
  const lista = leerGuardados();
  const fecha = new Date().toLocaleString("es", { dateStyle: "short", timeStyle: "short" });
  lista.unshift({ id: Date.now(), titulo: `${plantillaActual.nombre} · ${fecha}`, texto });
  escribirGuardados(lista);
  renderGuardados();
  mostrarEstado("Guardado.");
}

function renderGuardados() {
  const lista = leerGuardados();
  el.guardados.innerHTML = "";
  el.sinGuardados.hidden = lista.length > 0;
  for (const g of lista) {
    const li = document.createElement("li");
    const abrir = document.createElement("button");
    abrir.type = "button";
    abrir.className = "titulo";
    abrir.textContent = g.titulo;
    abrir.addEventListener("click", () => { el.resultado.value = g.texto; mostrarEstado("Prompt cargado."); });
    const borrar = document.createElement("button");
    borrar.type = "button";
    borrar.className = "borrar";
    borrar.textContent = "✕";
    borrar.setAttribute("aria-label", "Borrar " + g.titulo);
    borrar.addEventListener("click", () => {
      escribirGuardados(leerGuardados().filter((x) => x.id !== g.id));
      renderGuardados();
    });
    li.append(abrir, borrar);
    el.guardados.append(li);
  }
}

function renderTodo() {
  renderCategorias();
  renderPlantillas();
  renderFormulario();
  actualizarResultado();
}

el.plantilla.addEventListener("change", () => {
  plantillaActual = CATEGORIAS[categoriaActual].find((p) => p.id === el.plantilla.value);
  renderTodo();
});
$("limpiar").addEventListener("click", renderTodo);
$("copiar").addEventListener("click", copiar);
$("guardar").addEventListener("click", guardar);

renderTodo();
renderGuardados();
