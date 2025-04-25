var fs = require("fs"),
  path = require("path");

var fontnik = require("fontnik"),
  glyphCompose = require("@mapbox/glyph-pbf-composite");

var DEBUG = false;

var outputDir = "_output";

var sizeSumTotal = 0;

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

var doFonts = (dir, fonts) => {
  var makeGlyphs = (config) => {
    var sourceFonts = {};

    var folderName = outputDir + "/" + config.name;

    config.sources.forEach((sourceName) => {
      if (!sourceFonts[sourceName]) {
        try {
          sourceFonts[sourceName] = fs.readFileSync(dir + "/" + sourceName);
        } catch (e) {}
      }
    });

    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
    }

    var sizeSum = 0;
    var histogram = new Array(256);

    var doRange = (start, end) =>
      Promise.all(
        config.sources.map((sourceName) => {
          var source = sourceFonts[sourceName];
          if (!source) {
            console.log('[%s] Source "%s" not found', config.name, sourceName);
            return Promise.resolve();
          }

          return new Promise((resolve, reject) => {
            fontnik.range(
              {
                font: source,
                start: start,
                end: end,
              },
              (err, data) => {
                if (err) {
                  reject();
                } else {
                  resolve(data);
                }
              },
            );
          });
        }),
      ).then((results) => {
        results = results.filter((r) => !!r);
        var combined = glyphCompose.combine(results);
        var size = combined.length;
        sizeSum += size;
        histogram[start / 256] = size;
        if (DEBUG) {
          console.log("[%s] Range %s-%s size %s B", config.name, start, end, size);
        }
        fs.writeFileSync(folderName + "/" + start + "-" + end + ".pbf", combined);
      });

    var ranges = [];
    for (var i = 0; i < 65536; i = i + 256) {
      ranges.push([i, Math.min(i + 255, 65535)]);
    }

    console.log("[%s]", config.name);
    var fontPromise;
    if (DEBUG) {
      return ranges.reduce(
        (p, range) => p.then(() => doRange(range[0], range[1])),
        Promise.resolve(),
      );
    } else {
      fontPromise = Promise.all(ranges.map((range) => doRange(range[0], range[1])));
    }
    return fontPromise.then(() => {
      console.log(
        " Size histo [kB]: %s",
        histogram.map((v) => (v > 512 ? Math.round(v / 1024) : "")).join("|"),
      );
      console.log(" Total size %s B", sizeSum);
      sizeSumTotal += sizeSum;
    });
  };

  // would be much faster in parallel, but this is better for logging
  return fonts.reduce((p, font) => p.then(() => makeGlyphs(font)), Promise.resolve());
};

var todo = [];
fs.readdirSync(".").forEach((dir) => {
  if (fs.lstatSync(dir).isDirectory()) {
    var fonts;
    try {
      fonts = require(path.resolve(__dirname, dir, "fonts.json"));
      fonts.forEach((font) => {
        font.sources = font.sources.filter((f) => {
          // skip sources starting with '//' -- these are "commented"
          return f.indexOf("//") === -1;
        });
      });
    } catch (e) {
      fonts = [];
      fs.readdirSync(dir).forEach((file) => {
        if (path.extname(file) == ".ttf" || path.extname(file) == ".otf") {
          // compatible font name generation with genfontgl
          var rex = /([A-Z])([A-Z])([a-z])|([a-z])([A-Z])/g;
          fonts.push({
            name: path.basename(file).slice(0, -4).replace("-", "").replace(rex, "$1$4 $2$3$5"),
            sources: [basename(file)],
          });
        }
      });
    }
    if (fonts && fonts.length) {
      todo.push([dir, fonts]);
    }
  }
});

// would be much faster in parallel, but this is better for logging
todo
  .reduce(
    (p, pair) =>
      p.then(() => {
        console.log("Directory [%s]:", pair[0]);
        return doFonts(pair[0], pair[1]);
      }),
    Promise.resolve(),
  )
  .then(() => {
    console.log("Total size %s B", sizeSumTotal);
  });
