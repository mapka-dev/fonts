import pino from 'pino';
import { existsSync, lstatSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { fontToGlyphs, readFont } from "@mapka/font-sdf";
import { combine } from "@mapka/font-sdf-composite";
import { mkdir, rm } from 'node:fs/promises';
import { isMainThread, Worker, workerData } from 'node:worker_threads';
import { availableParallelism } from 'node:os';


const logger = pino({
  transport: {
    target: 'pino-pretty'
  },
})

interface TodoFont {
  name: string;
  sources: string[];
}

const spaceRex = /([A-Z])([A-Z])([a-z])|([a-z])([A-Z])/g;

/**
 * Compatible font name with genfontgl
 * @see https://docs.maptiler.com/guides/self-hosting/map-server/how-to-work-with-fonts-and-labels-in-maptiler-server/
 */
function fontName(file: string) {
  return basename(file)
    .slice(0, -4)
    .replace('-', '')
    .replace(spaceRex, '$1$4 $2$3$5');
}

/**
 * Create a todo list of fonts to generate.
 * @see https://docs.maptiler.com/guides/self-hosting/map-server/how-to-create-and-use-custom-fonts-in-maptiler-server/
 */
async function getFontsTodo() {
  const todo: [string, TodoFont][] = [];

  for (const entry of readdirSync('.')) {
    if (lstatSync(entry).isDirectory()) {
      const fontsPath = resolve(import.meta.dirname, entry, 'fonts.json');

      if (existsSync(fontsPath)) {
        logger.info(`Found fonts.json for ${entry}`);
        const { default: fonts } = await import(fontsPath, { with: { type: 'json' } });
        for (const font of fonts) {
          todo.push([entry, font]);
        }
      } else {
        logger.info(`Reading fonts from ${entry}`);
        for (const file of readdirSync(entry)) {
          if (file.endsWith('.ttf') || file.endsWith('.otf')) {
            todo.push([
              entry,
              {
                name: fontName(file),
                sources: [
                  file
                ]
              }
            ]);
          }
        }
      }
    }
  }
  return todo;
}


const distDir = "dist"

async function clearDist() {
  if (existsSync(distDir)) {
    await rm(distDir, {
      recursive: true, 
      force: true 
    });
  }
}

async function ensureDir(path: string) {
  if (!existsSync(path)) {
    logger.info(`Creating dir ${path}`);
    await mkdir(path, { recursive: true });
  }
}


const ranges: [number, number][] = []
for(let i = 0; i < 65535; i += 256) {
  ranges.push([i, i + 255]);
}


async function processFont(dir: string, font: TodoFont) {
  const {
    name,
    sources,
  } = font;

  logger.info(`Processing ${name} font`);

  const start = Date.now()

  const dest = join(distDir, name);
  await ensureDir(dest);
  
  const fonts = await Promise.all(
    sources.map((source) => readFont(join(dir, source)))
  );

  for (const [from, to] of ranges) {
    const combined = combine(
      fonts.map((font) => fontToGlyphs(font, from, to))
    );
    writeFileSync(join(dest, `${from}-${to}.pbf`), combined);
  }
  const end = Date.now();

  logger.info(`Generated font ${name} in ${end - start}ms`);
}


async function processFonts(todo: [string, TodoFont][]) {
  logger.info(todo.map(([dir, {name}]) => `${dir}-${name}`), 'Processing fonts');
 
  for (const [dir, font] of todo) {
    await processFont(dir, font);
  }
}

if (isMainThread) {
  await clearDist();

  const todo = await getFontsTodo();
  const maxThreads = availableParallelism()

  logger.info(`Processing ${todo.length} fonts on ${maxThreads} workers`);

  const workSize = todo.length / maxThreads;

  for (let i = 0; i < todo.length; i += workSize) {
    const worker = new Worker(import.meta.filename, {
      workerData: todo.slice(i, i + workSize)
    })
    worker.on('exit', () => {
      logger.info('Worker finished work');
    });
    worker.on('error', (err) => {
      logger.error(err, 'Worker error');
    });
  }
} else {
  logger.info('Worker started');
  await processFonts(workerData);
}
