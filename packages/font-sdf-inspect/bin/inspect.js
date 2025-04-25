#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { inspectRaw, inspectHtml } from '../lib/index.js';

const options = {
  'html': { type: 'boolean' },
  'raw': { type: 'boolean' },
};

const { values, positionals: [filename] } = parseArgs({ options, allowPositionals: true });

if(!filename) {
  throw new Error('Filename required usage: inspect ./0-255.pbf');
}

if (values.html) {
  inspectHtml(filename);
} else {
  inspectRaw(filename);
}