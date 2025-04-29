import pino from 'pino';
import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fontToGlyphs, readFont } from "@mapka/font-sdf";
import { mkdir, rm } from 'node:fs/promises';
import { isMainThread, Worker, workerData } from 'node:worker_threads';
import { availableParallelism } from 'node:os';

const distDir = "dist"
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


async function processFont(dir: string, fontTodo: TodoFont) {
  const {
    name,
    source,
  } = fontTodo;

  logger.info(`Processing ${name} font`);

  const start = Date.now()

  const font = await readFont(source)
  const family = font.tables.name.preferredFamily?.en || font.tables.name.fontFamily?.en;
  const style = font.tables.name.preferredSubfamily?.en || font.tables.name.fontSubfamily?.en;

  const dest = join(distDir, `${family} ${style}`);
  await ensureDir(dest);

  for (const [from, to] of ranges) {
    const sdfs = fontToGlyphs(font, from, to)
    writeFileSync(join(dest, `${from}-${to}.pbf`), sdfs);
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
