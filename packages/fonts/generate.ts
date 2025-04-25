import pino from 'pino';

import { existsSync, lstatSync, readdirSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { fontToGlyphs, readFont } from "@mapka/glyph-pbf";

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
    .replace('-','')
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
        const {default: fonts} = await import(fontsPath, {with: {type: 'json'}});
        todo.push([entry, fonts]);
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

async function processFont(dir: string, font: TodoFont) {
  const {
    name,
    sources,
  } = font;

  logger.info(`Processing ${dir} - ${name}`);

  const glyphs = await Promise.all(sources.map(async (source) => {
    const start = Date.now()

    const fontPath = join(dir, source)
    const font = await readFont(fontPath);
    const buffer = fontToGlyphs(font);
    
    const end = Date.now()

    logger.info(`Generated ${name} - ${source} in ${end - start}ms`);
    return buffer;
  }));

  return
}


async function processFonts(todo: [string, TodoFont][]) {
  logger.info('Processing fonts');

  for (const [dir, font] of todo) {
    await processFont(dir, font);
  }
}

const todo = await getFontsTodo();

await processFonts(todo);
