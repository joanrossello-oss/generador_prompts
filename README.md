# Generador de Prompts

App web para generar, guardar y mejorar prompts de programación y trabajo. Funciona en el navegador (Mac e iPhone) y se puede instalar como PWA.

**Web publicada:** https://joanrossello-oss.github.io/generador_prompts/

## Uso

La app tiene tres secciones.

### Generar
1. Elige una categoría y un tipo de prompt (depurar un error, revisar código, redactar un email…).
2. Rellena los campos. Los marcados con `*` son obligatorios.
3. El prompt se construye a medida que escribes, y puedes editarlo a mano en el cuadro de la derecha.
4. Usa los botones:
   - **Copiar**: copia el prompt al portapapeles.
   - **Guardar**: lo guarda con un título y etiquetas opcionales.
   - **Copiar para mejorar en Claude**: copia tu prompt con instrucciones de mejora. Pégalo en la app de Claude y te devuelve una versión optimizada, sin coste de API.
   - **Mejorar con API** (solo con el servidor y una clave, ver más abajo): mejora el prompt directamente y permite deshacer el cambio.

### Guardados
Busca por texto, filtra por etiquetas o favoritos, copia o borra prompts, y edita sus etiquetas. Desde aquí también puedes **exportar** e **importar** una copia en JSON para pasar tus datos entre dispositivos.

### Plantillas
Crea plantillas propias con los campos que necesites (texto corto, texto largo, lista de opciones, obligatorio, «es código»). Las plantillas base no se modifican, pero puedes **duplicarlas y editarlas**.

> Los prompts y plantillas se guardan en el navegador de cada dispositivo (`localStorage`). Para llevarlos de uno a otro, usa Exportar / Importar.

## Instalar en el iPhone
Abre la web en Safari y pulsa Compartir → **Añadir a pantalla de inicio**.

## Desarrollo

Requisitos: Node 22 o superior.

```bash
npm install
npm run dev        # servidor de desarrollo con recarga
npm run build      # comprueba tipos y genera dist/
```

Stack: React, TypeScript, Vite, Tailwind CSS y `vite-plugin-pwa`.

## Servidor opcional con la API de Claude

Para tener el botón **Mejorar con API** hace falta un servidor pequeño que guarda la clave fuera del navegador. Es de pago por uso (ver [precios](https://platform.claude.com)).

```bash
cp .env.example .env     # pega tu clave en ANTHROPIC_API_KEY
npm start                # compila y sirve la app en http://localhost:3000
```

Variables opcionales en `.env`:

| Variable | Por defecto | Descripción |
|---|---|---|
| `PORT` | `3000` | Puerto del servidor |
| `CLAUDE_MODEL` | `claude-opus-5-5` | Modelo usado para mejorar prompts (por ejemplo `claude-sonnet-5-5` es más barato) |

Para usarlo desde el iPhone en la misma wifi, abre `http://<IP-de-tu-Mac>:3000`.

> **Seguridad:** el servidor no pide contraseña. Cualquiera en tu red local podría gastar tu saldo de API. No lo expongas a internet sin añadir autenticación. Nunca subas el archivo `.env` (ya está en `.gitignore`).

Si trabajas con `npm run dev`, arranca también la API con `npm run api` en otra terminal.

## Despliegue en GitHub Pages

Cada push a `main` ejecuta `.github/workflows/pages.yml`, que compila la app y la publica. Requisitos:

1. Repositorio público (en cuentas gratuitas).
2. En **Settings → Pages**, origen **GitHub Actions**.

La versión publicada no incluye el servidor, así que allí solo está disponible «Copiar para mejorar en Claude».

## Estructura

```
src/
  data/plantillas.ts      plantillas base
  views/                  Generar, Guardados y Plantillas
  components/             UI y editor de plantillas
  lib/                    construcción del prompt, almacenamiento, portapapeles
server.js                 servidor opcional (sirve dist/ y llama a la API de Claude)
.github/workflows/        despliegue en Pages
```
