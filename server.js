import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

const PORT = Number(process.env.PORT) || 3000;
const MODEL = process.env.CLAUDE_MODEL || "claude-opus-5-5";
const MAX_BODY = 50_000;
const aqui = path.dirname(fileURLToPath(import.meta.url));

const DIST = path.join(aqui, "dist");
const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

const SYSTEM = `Eres un experto en ingeniería de prompts. Recibirás un prompt escrito por el usuario para otro asistente de IA y debes devolver una versión mejorada.

Reglas:
- Conserva la intención original y el idioma del prompt.
- No inventes datos, requisitos ni contexto que el usuario no haya dado. Si falta información importante, añade al final una sección "## Preguntas abiertas" con lo que el asistente debería aclarar.
- Mantén intactos los bloques de código, mensajes de error, nombres y valores literales.
- Haz explícitos el objetivo, el contexto, las restricciones y el formato de salida esperado.
- Elimina ambigüedades y redundancias; no alargues el prompt sin necesidad.
- Mantén la estructura en markdown si ya la tiene.
- Devuelve únicamente el prompt mejorado, sin explicaciones, saludos ni comillas alrededor.`;

let cliente;
const anthropic = () => (cliente ??= new Anthropic());

function responder(res, status, datos) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(datos));
}

async function leerJson(req) {
  let tamano = 0;
  const trozos = [];
  for await (const t of req) {
    tamano += t.length;
    if (tamano > MAX_BODY) throw Object.assign(new Error("Prompt demasiado largo"), { status: 413 });
    trozos.push(t);
  }
  try {
    return JSON.parse(Buffer.concat(trozos).toString("utf8"));
  } catch {
    throw Object.assign(new Error("JSON inválido"), { status: 400 });
  }
}

async function mejorar(req, res) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return responder(res, 500, { error: "Falta ANTHROPIC_API_KEY en el servidor (archivo .env)." });
  }
  const { prompt, enfoque } = await leerJson(req);
  if (typeof prompt !== "string" || !prompt.trim()) {
    return responder(res, 400, { error: "El prompt está vacío." });
  }

  const peticion = enfoque ? `${prompt}\n\n(Enfoque pedido para la mejora: ${enfoque})` : prompt;
  const respuesta = await anthropic().messages.create({
    model: MODEL,
    max_tokens: 16000,
    output_config: { effort: "low" },
    system: SYSTEM,
    messages: [{ role: "user", content: `<prompt_original>\n${peticion}\n</prompt_original>` }],
  });

  if (respuesta.stop_reason === "refusal") {
    return responder(res, 422, { error: "Claude no pudo procesar este prompt." });
  }
  const texto = respuesta.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
  if (!texto) return responder(res, 502, { error: "Claude no devolvió texto." });
  responder(res, 200, { mejorado: texto });
}

function errorApi(res, err) {
  if (err.status && !(err instanceof Anthropic.APIError)) {
    return responder(res, err.status, { error: err.message });
  }
  if (err instanceof Anthropic.AuthenticationError) {
    return responder(res, 401, { error: "La clave de API no es válida." });
  }
  if (err instanceof Anthropic.RateLimitError) {
    return responder(res, 429, { error: "Límite de uso alcanzado. Inténtalo en unos segundos." });
  }
  if (err instanceof Anthropic.APIConnectionError) {
    return responder(res, 502, { error: "No se pudo conectar con la API de Claude." });
  }
  console.error(err);
  responder(res, 500, { error: "Error inesperado al mejorar el prompt." });
}

const servidor = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, "http://localhost");

  if (req.method === "POST" && pathname === "/api/mejorar") {
    try {
      await mejorar(req, res);
    } catch (err) {
      errorApi(res, err);
    }
    return;
  }

  if (req.method === "GET" && pathname === "/api/estado") {
    return responder(res, 200, { mejorar: Boolean(process.env.ANTHROPIC_API_KEY) });
  }

  if (req.method !== "GET") return responder(res, 404, { error: "No encontrado" });

  // Solo se sirve el contenido de dist/ (server.js y .env quedan fuera).
  let archivo = path.join(DIST, path.normalize(pathname === "/" ? "/index.html" : pathname));
  if (!archivo.startsWith(DIST + path.sep)) return responder(res, 403, { error: "Prohibido" });
  let datos = await readFile(archivo).catch(() => null);
  if (!datos && !path.extname(pathname)) {
    archivo = path.join(DIST, "index.html");
    datos = await readFile(archivo).catch(() => null);
  }
  if (!datos) {
    const sinBuild = pathname === "/" || !path.extname(pathname);
    return responder(res, 404, { error: sinBuild ? "Falta compilar la app: ejecuta npm run build." : "No encontrado" });
  }
  res.writeHead(200, {
    "content-type": TIPOS[path.extname(archivo)] || "application/octet-stream",
    "cache-control": archivo.includes(`${path.sep}assets${path.sep}`) ? "public, max-age=31536000, immutable" : "no-cache",
  });
  res.end(datos);
});

servidor.listen(PORT, () => {
  console.log(`Generador de Prompts en http://localhost:${PORT}  (modelo: ${MODEL})`);
  if (!process.env.ANTHROPIC_API_KEY) console.warn("Aviso: ANTHROPIC_API_KEY no está definida; 'Mejorar con Claude' no funcionará.");
});
