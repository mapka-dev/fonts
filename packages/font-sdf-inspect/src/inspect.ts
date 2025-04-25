import { decode, type FontStack } from "@mapka/font-sdf";
import { existsSync, readFileSync, write, writeFileSync } from "node:fs";

export function inspectRaw(path: string) {
  if (!existsSync(path)) {
    throw new Error(`File not found: ${path}`);
  }

  const pbf = readFileSync(path);
  const {
    stacks: [first],
  } = decode(pbf);

  console.info(`Font: ${first.name}`);
  console.info(`Range: ${first.range}`);
  console.table(
    first.glyphs.map((glyph) => ({
      ...glyph,
      bitmap: glyph.bitmap ? `<Buffer ${glyph.bitmap.length}>` : null,
    })),
  );
}

const sdfViewer = (fontStack: FontStack) => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>SDF font ${fontStack.name}</title>
  <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no">

  <style>
    body { margin: 0; padding: 0; }
  </style>
</head>
<body>
  <div>
    <table>
      <thead>
        <tr>
          <th>id</th>
          <th>sdf</th>
          <th>width</th>
          <th>height</th>
          <th>left</th>
          <th>top</th>
        </tr>
      </thead>
      <tbody id="table-body"></tbody>
    </table>
  </div>
  <script>
    const range = ${JSON.stringify(fontStack.range)};
    const glyphs = ${JSON.stringify(fontStack.glyphs)};

    const [start, end] = range.split('-').map(Number);
    const table = document.getElementById('table-body');
    
    const smoothstep = (e0, e1, x) => {
      x = Math.max(Math.min((x - e1) / (e1 - e0), 1), 0);
      return x * x * (3 - 2 * x);
    };
    
    const renderSDF = (cell, glyph) => {
      const canv = document.createElement('canvas');
      const w = canv.width = glyph.width + 6;
      const h = canv.height = glyph.height + 6;
      const context = canv.getContext('2d');
      const image = context.getImageData(0, 0, w, h);
      
      for (let i = 0, j = -1; i < w * h; ++i) {
        const a = glyph.bitmap.data[i];
        image.data[++j] = 0;
        image.data[++j] = 0;
        image.data[++j] = 0;
        image.data[++j] = smoothstep(136, 168, a) * a;
      }
      
      context.putImageData(image, 0, 0);
      cell.appendChild(canv);
    };
    
    for (let i = start; i <= end; i++) {
      const row = document.createElement('tr');
      const id = document.createElement('td');
      const sdf = document.createElement('td');
      const width = document.createElement('td');
      const height = document.createElement('td');
      const left = document.createElement('td');
      const top = document.createElement('td');
      
      id.innerHTML = i;
      
      const glyph = glyphs.find((glyph) => glyph.id === i);
      if (glyph) {
        if (glyph.bitmap) renderSDF(sdf, glyph);

        width.innerHTML = glyph.width;
        height.innerHTML = glyph.height;
        left.innerHTML = glyph.left;
        top.innerHTML = glyph.top;
      }
      
      row.appendChild(id);
      row.appendChild(sdf);
      row.appendChild(width);
      row.appendChild(height);
      row.appendChild(left);
      row.appendChild(top);
      table.appendChild(row);
    }
  </script>
</body>
</html>`;
};

export function inspectHtml(path: string) {
  if (!existsSync(path)) {
    throw new Error(`File not found: ${path}`);
  }

  const pbf = readFileSync(path);
  const {
    stacks: [first],
  } = decode(pbf);

  const html = sdfViewer(first);

  writeFileSync(path.replace(/\.pbf$/, ".html"), html);
}
