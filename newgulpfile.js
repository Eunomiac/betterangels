// #region ████████ CONFIGURATION: Banner Headers, Source/Destination Globs, Build Behavior ████████
const BANNERTEMPLATE = {
  full: `/* ****▌███████████████████████████████████████████████████████████████████████████▐**** *\\
  |*     ▌█░░░░░░░░░ Better Angels for Foundry VTT ░░░░░░░░░░░█▐     *|
  |*     ▌██████████████████░░░░░░░░░░░░░ by Eunomiac ░░░░░░░░░░░░░██████████████████▐     *|
  |*     ▌█ <%= package.license %> License █ v<%= package.version %> █ ${new Date().toString().match(/\b[A-Z][a-z]+ \d+ \d+/).shift()} █▐     *|
  |*     ▌████░░░░ <%= package.url %> ░░░░█████▐     *|
  \\* ****▌███████████████████████████████████████████████████████████████████████████▐**** */`,
  min: [
    `/* ▌██░░ <%= package.name %> v<%= package.version %> (${new Date().getFullYear()})`,
    "<%= package.license %> License",
    "<%= package.url %> ░░██▐ */"
  ].join(" ║ ")
};
const BUILDFILES = {
  js: {
    "./dist/betterangels/scripts": ["scripts/**/*.mjs"],
    "./dist/betterangels/lib": ["lib/**/*.mjs", "lib/**/*.js", "lib/**/*.jsx"]
  },
  css: {
    "./dist/betterangels/css/": ["scss/**/*.scss"],
    "./css/": ["scss/**/*.scss"],
    "./dist/betterangels/lib": ["lib/**/*.scss", "lib/**/*.css"]
  },
  html: {
    "./dist/betterangels/templates": ["templates/**/*.html"]
  },
  assets: {
    "./dist/betterangels/assets": ["assets/**/*.*"],
    "./dist/betterangels/lang": ["lang/**/*.*"],
    "./dist/betterangels": ["system.json", "template.json", "LICENSE.txt"]
  }
};
const REGEXPPATTERNS = {
  js: [
    [ // Insert date and version info into file headers.
      /\/\* \*{4}▌.*?▐\*{4} \*\//s,
      (match) => {
        const padLine = (line, length) => {
          const padLength = length - line.length;
                      // console.log(line, line.length, length, padLength);
          if (padLength > 0) {
            const [padLeft, padRight] = [Math.ceil(padLength / 2), Math.ceil(padLength / 2)];
                          // console.log(padLeft, padRight);
            const [lineLeft, lineRight] = [
              line.slice(0, Math.floor(line.length / 2)),
              line.slice(Math.floor(line.length / 2))
            ];
                          // Two types of padding: '█' and '░'. Count amount of each to get relative ratio.
            const fadePad = lineLeft.match(/░+/u)?.pop().length ?? 0;
            const fullFadeRatio = fadePad === 0 ? 1 : (lineLeft.match(/░+/)?.pop().length ?? 0) / fadePad;
                          // console.log(fullPad, fadePad, fullFadeRatio);
            let numFullPadLeft = Math.round((fullFadeRatio * padLeft) / (1 + fullFadeRatio)),
                numFadePadLeft = 0,
                numFullPadRight = Math.round((fullFadeRatio * padRight) / (1 + fullFadeRatio)),
                numFadePadRight = 0;
            if (fadePad > 0) {
              numFadePadLeft = padLeft - numFullPadLeft;
              numFadePadRight = padRight - numFullPadRight;
            } else {
              numFullPadLeft = padLeft;
              numFullPadRight = padRight;
            }
            numFullPadRight += padLength - (numFullPadLeft + numFadePadLeft + numFullPadRight + numFadePadRight);
            return [
              lineLeft.replace(/▌█/u, `▌${"█".repeat(numFullPadLeft + 1)}`)
                .replace(/░/u, "░".repeat(numFadePadLeft + 1)),
              lineRight.replace(/█▐/u, `${"█".repeat(numFullPadRight + 1)}▐`)
                .replace(/░/u, "░".repeat(numFadePadRight + 1))
            ].join("");
          }
          return line;
        };
        const lines = match.split(/\n/s);
        const returnLines = [];
        let [maxIndex, maxLen] = [0, 0];
        lines.forEach((line, i) => {
          if (line.length > maxLen) {
            maxIndex = i;
            maxLen = line.length;
          }
        });
        lines.forEach((line) => {
          if (line.length < maxLen) {
            returnLines.push(padLine(line, maxLen));
          } else {
            returnLines.push(line);
          }
        });
        returnLines.push("\n");
                  // returnLines[returnLines.length - 1] = `\\${returnLines[returnLines.length - 1]}`.replace(/██/u, "█");
        return returnLines.join("\n");
      }
    ],
    [/\n?\s*\/\*~(.|\n)*?~\*\/\n?/gs, ""], // Strip multi-line comments of form '/*~ ... ~*/'
    [/\n?\s*\/\*\*(.|\n)*?\*\/\n?/gs, ""], // Strip multi-line comments beginning with '/**'
    [/\n?\s*\/\*DEVCODE\*\/(.|\n)*?\/\*!DEVCODE\*\/\n?/gs, ""], // Strip developer code between '/*DEVCODE*/' and '/*!DEVCODE*/'
    [/\n?\s*\/\/~.*?$/gm, ""], // Strip single-line comments beginning with '//~'
    [/\s*\/\/\s*eslint.*$/gm, ""], // Strip eslint enable/disable single-line comments
    [/\s*\/\*\s*eslint[^*]*\*\/\s*/g, ""], // Strip eslint enable/disable mult-line comments
    [/\s*\/\/ no default.*$/gm, ""], // Strip '// no default'
    [/\s*\/\/ falls through.*$/gm, ""], // Strip '// falls through'
    [/\s*~$/gm, ""], // Strip '~' from end-of-lines (used for automatic region folding)
    [/#reg.*? /gs, ""], // Convert region headers to standard headers
          // [/\n?\s*\/\/ #endreg[^\n]+/gs, ""] // Remove region footers
    [/^\s*\/\/ #endreg.*$/gm, ""], // Remove region footers
    [/(^[ \t]*\r?\n[ \t]*$){2,}/gm, "\n"],  // Strip excess blank lines
    [/(\s*\n\s*)+/gs, "$1"], // Strip excess blank lines
    [/\s*\n$/g, ""], // Strip whitespace from end of files
    [/^\s*\n/g, ""] // Strip whitespace from start of files
  ],
  html: []
};
const BANNERS = {
  js: {...BANNERTEMPLATE},
  css: {...BANNERTEMPLATE}
};
  // #endregion ▄▄▄▄▄ CONFIGURATION ▄▄▄▄▄

  // #region ▒░▒░▒░▒[INITIALIZATION]▒░▒░▒░▒ ~
const {src, dest, watch, series, parallel} = require("gulp");

const rename = require("gulp-rename");
const header = require("gulp-header");
const replacer = require("gulp-replace");
const clean = require("del");

const minifyJS = require("gulp-terser");
const optimizeJS = require("gulp-optimize-js");

const bundleCSS = require("gulp-postcss");
const prefix = require("gulp-autoprefixer");
const sass = require("gulp-sass")(require("node-sass"));
const minifyCSS = require("cssnano");

const packageJSON = require("./package");

const BUILDFUNCS = {};
const DEFAULTBUILDFUNCS = [];
  // #endregion ▒▒▒▒[INITIALIZATION]▒▒▒▒

  // #region ████████ CLEAR DIST: Clear Out /dist Folder ████████ ~
const cleanDest = (destGlob) => (done) => {
  clean.sync([destGlob]);
  return done();
};
BUILDFUNCS.init = cleanDest("./dist");
  // #endregion ▄▄▄▄▄ CLEAR DIST ▄▄▄▄▄

  // #region ████████ JS: Compiling Javascript ████████ ~
const BUILDFUNCS_JS = ((sourceDestGlobs) => {
  const compiledJSFuncs = [];
  for (const [destGlob, sourceGlobs] of Object.entries(sourceDestGlobs)) {
    for (const sourceGlob of sourceGlobs) {
      compiledJSFuncs.push(() => {
        let gulpStream = src(sourceGlob)
          .pipe(header(BANNERS.js.full, {"package": packageJSON}));
        for (const [rxpFind, rxpReplace] of REGEXPPATTERNS.js) {
          gulpStream = gulpStream.pipe(replacer(rxpFind, rxpReplace));
        }
        return gulpStream
          // .pipe(optimizeJS())
          .pipe(dest(destGlob))
          .pipe(rename({suffix: ".min"}))
          .pipe(minifyJS())
          .pipe(header(BANNERS.js, {"package": packageJSON}))
          .pipe(dest(destGlob));
      });
    }
  }
  return compiledJSFuncs;
})(BUILDFILES.js);

if (BUILDFUNCS_JS.length) {
  BUILDFUNCS.js = series(cleanDest("./dist/betterangels/scripts"), parallel(...BUILDFUNCS_JS));
  DEFAULTBUILDFUNCS.push(BUILDFUNCS.js);
}
  // #endregion ▄▄▄▄▄ JS ▄▄▄▄▄
  // #region ████████ CSS: Compiling CSS ████████ ~
const BUILDFUNCS_CSS = ((sourceDestGlobs) => {
  const compiledCSSFuncs = [];
  for (const [destGlob, sourceGlobs] of Object.entries(sourceDestGlobs)) {
    for (const sourceGlob of sourceGlobs) {
      compiledCSSFuncs.push(
        () => src(sourceGlobs)
          /* .pipe(bundleCSS([
            sass({outputStyle: "expanded"}),
            prefix({cascade: false}),
            header(BANNERS.css.min, {"package": packageJSON}),
            minifyCSS
          ])) */
          .pipe(sass({outputStyle: "expanded"})
            .on("error", function reportError(err) { console.log(err.toString()); this.emit("end") }))
          .pipe(prefix({cascade: false}))
          .pipe(header(BANNERS.css.min, {"package": packageJSON}))
          // .pipe(minifyCSS())
          .pipe(dest(destGlob))
      );
    }
  }
  return compiledCSSFuncs;
})(BUILDFILES.css);

if (BUILDFUNCS_CSS.length) {
  BUILDFUNCS.css = series(cleanDest("./dist/betterangels/css"), ...BUILDFUNCS_CSS);
  DEFAULTBUILDFUNCS.push(BUILDFUNCS.css);
}
  // #endregion ▄▄▄▄▄ CSS ▄▄▄▄▄
  // #region ████████ HTML: Compiling HTML ████████ ~
const BUILDFUNCS_HTML = ((sourceDestGlobs) => {
  const compiledHTMLFuncs = [];
  for (const [destGlob, sourceGlobs] of Object.entries(sourceDestGlobs)) {
    for (const sourceGlob of sourceGlobs) {
      compiledHTMLFuncs.push(() => REGEXPPATTERNS.html
        .reduce((gulper, replaceArgs) => gulper.pipe(replacer(...replaceArgs)), src(sourceGlob))
        .pipe(dest(destGlob)));
    }
  }
  return compiledHTMLFuncs;
})(BUILDFILES.html);

if (BUILDFUNCS_HTML.length) {
  BUILDFUNCS.html = series(cleanDest("./dist/betterangels/templates"), parallel(...BUILDFUNCS_HTML));
  DEFAULTBUILDFUNCS.push(BUILDFUNCS.html);
}
  // #endregion ▄▄▄▄▄ HTML ▄▄▄▄▄
  // #region ████████ ASSETS: Copying Assets to Dist ████████ ~
const BUILDFUNCS_ASSETS = ((sourceDestGlobs) => {
  const compiledAssetFuncs = [];
  for (const [destGlob, sourceGlobs] of Object.entries(sourceDestGlobs)) {
    for (const sourceGlob of sourceGlobs) {
      compiledAssetFuncs.push(
        () => src(sourceGlobs)
          .pipe(dest(destGlob))
      );
    }
  }
  return compiledAssetFuncs;
})(BUILDFILES.assets);

if (BUILDFUNCS_ASSETS.length) {
  BUILDFUNCS.assets = series(cleanDest("./dist/betterangels/assets"), parallel(...BUILDFUNCS_ASSETS));
  DEFAULTBUILDFUNCS.push(BUILDFUNCS.assets);
}
  // #endregion ▄▄▄▄▄ CSS ▄▄▄▄▄

  // #region ████████ WATCH: Watch Tasks to Fire On File Update ████████ ~
function watchUpdates() {
  for (const type of Object.keys(BUILDFUNCS)) {
    Object.values(BUILDFILES[type] || {}).forEach((sourceGlob) => watch(sourceGlob, BUILDFUNCS[type]));
  }
}
BUILDFUNCS.watch = watchUpdates;
DEFAULTBUILDFUNCS.push(watchUpdates);
  // #endregion ▄▄▄▄▄ WATCH ▄▄▄▄▄

  // #region ▒░▒░▒░▒[EXPORTS]▒░▒░▒░▒ ~
exports.default = series(
  BUILDFUNCS.init,
  parallel(...DEFAULTBUILDFUNCS)
);
/* for (const [expType, expFunc] of Object.entries(BUILDFUNCS)) {
  exports[expType] = expFunc;
} */
  // #endregion ▒▒▒▒[EXPORTS]▒▒▒▒
