import pino from 'pino';
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { loadEnvFile } from 'node:process';

loadEnvFile()

const fontsDir = "fonts"

const logger = pino({
  transport: {
    target: 'pino-pretty'
  },
})

interface TodoFont {
  name: string;
  source: string;
}


/**
 * Create a todo list of fonts to generate.
 * @see https://docs.maptiler.com/guides/self-hosting/map-server/how-to-create-and-use-custom-fonts-in-maptiler-server/
 */
async function getFontsTodo() {
  const todo: [string, TodoFont][] = [];

  for (const entry of readdirSync('./fonts')) {
    for (const fontFile of readdirSync(join(fontsDir, entry), {recursive: true, encoding: 'utf8'})) {
      if(fontFile.includes("Variable")) {
        continue;
      }
      if (fontFile.endsWith('.ttf') || fontFile.endsWith('.otf')) {
        todo.push([
          entry,
          {
            name: fontFile,
            source: join(fontsDir, entry, fontFile)
          }
        ]);
      }
    }
  }
  return todo;
}

interface Options {
  apiUrl: string;
  apiKey: string;
}

async function processFonts(todo: [string, TodoFont][], {apiKey, apiUrl}: Options) {
  for (const [dir, {name, source}] of todo) {
    logger.info(`Processing font ${dir}-${name}`);

    const start = Date.now()
  
    const body = new FormData();
    const blob  = new Blob([
      readFileSync(source)
    ]);
    body.append("file", blob, source);
  
    await fetch(apiUrl, {
      method: "POST",
      body,
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    }).then(async (res) => {
      if (!res.ok) {
        throw new Error("Failed to upload font");
      }
    });
  
    const end = Date.now();
  
    logger.info(`Uploaded font ${name} in ${end - start}ms`);
  }
}

const todo = await getFontsTodo();

const { 
  MAPKA_DEV_API_URL,
  MAPKA_DEV_API_KEY,
  MAPKA_PROD_API_URL,
  MAPKA_PROD_API_KEY,
} = process.env;


if (MAPKA_DEV_API_URL && MAPKA_DEV_API_KEY) {
  await processFonts(todo, {
    apiUrl: MAPKA_DEV_API_URL,
    apiKey: MAPKA_DEV_API_KEY,
  });
}

if (MAPKA_PROD_API_URL && MAPKA_PROD_API_KEY) {
  await processFonts(todo, {
    apiUrl: MAPKA_PROD_API_URL,
    apiKey: MAPKA_PROD_API_KEY,
  });
}