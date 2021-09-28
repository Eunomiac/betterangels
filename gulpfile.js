// #region ▮▮▮▮▮▮▮[UTILITY] Utility Functions for File Parsing ▮▮▮▮▮▮▮ ~
const padHeaderLines = (match) => {
  const padLine = (line, length) => {
    const padLength = length - line.length;
    if (padLength > 0) {
      const [padLeft, padRight] = [Math.ceil(padLength / 2), Math.ceil(padLength / 2)];
      const [lineLeft, lineRight] = [
        line.slice(0, Math.floor(line.length / 2)),
        line.slice(Math.floor(line.length / 2))
      ];
      // Two types of padding: '█' and '░'. Count amount of each to get relative ratio.
      const fadePad = lineLeft.match(/░+/u)?.pop().length ?? 0;
      const fullFadeRatio = fadePad === 0 ? 1 : (lineLeft.match(/░+/)?.pop().length ?? 0) / fadePad;
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
  return returnLines.join("\n");
};
// #endregion ▮▮▮▮[UTILITY]▮▮▮▮

// #region ████████ CONFIGURATION: Banner Headers, Source/Destination Globs, Build Behavior ████████
const BANNERTEMPLATE = {
  full: `/* ****▌███████████████████████████████████████████████████████████████████████████▐**** *\\
|*     ▌█░░░░░░░░░ Better Angels for Foundry VTT ░░░░░░░░░░░█▐     *|
|*     ▌██████████████████░░░░░░░░░░░░░ by Eunomiac ░░░░░░░░░░░░░██████████████████▐     *|
|*     ▌█ <%= package.license %> License █ v<%= package.version %> █ ${new Date().toString().match(/\b[A-Z][a-z]+ \d+ \d+/).shift()} █▐     *|
|*     ▌████░░░░ <%= package.url %> ░░░░█████▐     *|
\\* ****▌███████████████████████████████████████████████████████████████████████████▐**** */\n\n`,
  min: [
    `/* ▌██░░ <%= package.name %> v<%= package.version %> (${new Date().getFullYear()})`,
    "<%= package.license %> License",
    "<%= package.url %> ░░██▐ */"
  ].join(" ║ ")
};
const BUILDFILES = {
  js: {
    "./dist/betterangels/scripts/": ["scripts/**/*.mjs"]
  },
  css: {
    "./dist/betterangels/css/": ["scss/**/*.scss"],
    "./css/": ["scss/**/*.scss"]
  },
  html: {
    "./dist/betterangels/templates/": ["templates/**/*.html"]
  },
  assets: {
    "./dist/betterangels/assets/": ["assets/**/*.*"],
    "./dist/betterangels/": ["system.json", "template.json", "LICENSE.txt", "package.json"]
  }
};
const REGEXPPATTERNS = {
  js: [
    [/\n?\s*\/\*DEVCODE\*\/(.|\n)*?\/\*!DEVCODE\*\/\n?/gs, ""], // Strip developer code
    [/\/\* \*{4}▌.*?▐\*{4} \*\//s, padHeaderLines], // Pad header lines to same length
    [/\/\*[*~](.|\n|\r)*?\*\//g, ""], // Strip multi-line comments beginning with '/*~' or '/**'
    [/\n?\s*\/\/~.*?$/gm, ""], // Strip single-line comments beginning with '//~'
    [/\s*\/\/\s*eslint.*$/gm, ""], // Strip eslint enable/disable single-line comments
    [/\s*\/\*\s*eslint[^*]*\*\/\s*/g, ""], // Strip eslint enable/disable mult-line comments
    [/\s*\/\/ no default.*$/gm, ""], // Strip '// no default'
    [/\s*\/\/ falls through.*$/gm, ""], // Strip '// falls through'
    [/\s*~$/gm, ""], // Strip '~' from end-of-lines (used for automatic region folding)
    [/#reg.*? /gs, ""], // Convert region headers to standard headers
    [/^\s*\/\/ #endreg.*$/gm, "\n"], // Remove region footers
    [/(\r?\n[ \t]*(?=\r?\n)){2,}/g, "\n"],  // Strip excess blank lines
    [/\s*\n$/g, ""], // Strip whitespace from end of files
    [/^\s*\n/g, ""] // Strip whitespace from start of files
  ],
  html: []
};
const PIPES = {
  jsFull: (source, destination) => function pipeFullJS() {
    return REGEXPPATTERNS.js
      .reduce(
        (pipeline, replacerArgs) => pipeline.pipe(replacer(...replacerArgs)),
        src(source)
          .pipe(header(BANNERS.js.full, {"package": packageJSON}))
      )
      .pipe(dest(destination));
  },
  jsMin: (source, destination) => function pipeMinJS() {
    return REGEXPPATTERNS.js
      .reduce(
        (pipeline, replacerArgs) => pipeline.pipe(replacer(...replacerArgs)),
        src(source)
      )
      .pipe(renamer({suffix: ".min"}))
      // .pipe(terser())
      .pipe(header(BANNERS.js.min, {"package": packageJSON}))
      .pipe(dest(destination));
  },
  cssFull: (source, destination) => function pipeFullCSS() {
    return src(source)
      .pipe(sass({outputStyle: "nested"}))
      .pipe(postCSS([
        autoprefixer({cascade: false})
      ]))
      .pipe(dest(destination));
  },
  cssMin: (source, destination) => function pipeMinCSS() {
    return src(source)
      .pipe(sass({outputStyle: "compressed"}))
      .pipe(postCSS([
        autoprefixer({cascade: false}),
        cssnano()
      ]))
      .pipe(header(BANNERS.css.min, {"package": packageJSON}))
      .pipe(dest(destination));
  },
  html: (source, destination) => function pipeHTML() {
    return REGEXPPATTERNS.html
      .reduce(
        (pipeline, replacerArgs) => pipeline.pipe(replacer(...replacerArgs)),
        src(source)
      )
      .pipe(dest(destination));
  },
  toDest: (source, destination) => function pipeToDest() {
    return src(source).pipe(dest(destination));
  }
};
// #endregion ▄▄▄▄▄ CONFIGURATION ▄▄▄▄▄

// #region ▒░▒░▒░▒[INITIALIZATION]▒░▒░▒░▒ ~
const {src, dest, watch, series, parallel} = require("gulp");

const cleaner = require("del");
const renamer = require("gulp-rename");
const header = require("gulp-header");
const replacer = require("gulp-replace");

const terser = require("gulp-terser");

const sass = require("gulp-sass")(require("node-sass"));
const postCSS = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");

const packageJSON = require("./package");

const BANNERS = {
  js: {...BANNERTEMPLATE},
  css: {...BANNERTEMPLATE}
};

const BUILDSERIES = [];
const BUILDFUNCS = {};
const PIPEFUNCS = [];
// #endregion ▒▒▒▒[INITIALIZATION]▒▒▒▒

// #region ████████ CLEAR DIST: Clear Out /dist Folder ████████ ~
BUILDSERIES.push((done) => {
  try { cleaner.sync(["./dist/"]) } catch (err) { /*~ Skip ~*/ }
  return done();
});
// #endregion ▄▄▄▄▄ CLEAR DIST ▄▄▄▄▄

// #region ████████ JS: Compiling Javascript ████████ ~
BUILDFUNCS.js = parallel(...((buildFiles) => {
  const funcs = [];
  for (const [destGlob, sourceGlobs] of Object.entries(buildFiles)) {
    sourceGlobs.forEach((sourceGlob) => {
      funcs.push(PIPES.jsMin(sourceGlob, destGlob));
      funcs.push(PIPES.jsFull(sourceGlob, destGlob));
    });
  }
  return funcs;
})(BUILDFILES.js));

// BUILDFUNCS.js = parallel(...BUILDFUNCS_JS);
// DEFAULTBUILDFUNCS.push(BUILDFUNCS.js);
// #endregion ▄▄▄▄▄ JS ▄▄▄▄▄

// #region ████████ CSS: Compiling CSS ████████ ~
BUILDFUNCS.css = parallel(...((sourceDestGlobs) => {
  const funcs = [];
  for (const [destGlob, sourceGlobs] of Object.entries(sourceDestGlobs)) {
    sourceGlobs.forEach((sourceGlob) => {
      funcs.push(PIPES[/dist/.test(destGlob) ? "cssMin" : "cssFull"](sourceGlob, destGlob));
    });
  }
  return funcs;
})(BUILDFILES.css));

// if (BUILDFUNCS_CSS.length) {
//   BUILDFUNCS.css = parallel(...BUILDFUNCS_CSS);
//   DEFAULTBUILDFUNCS.push(BUILDFUNCS.css);
// }
// #endregion ▄▄▄▄▄ CSS ▄▄▄▄▄
// #region ████████ HTML: Compiling HTML ████████ ~
BUILDFUNCS.html = parallel(...((sourceDestGlobs) => {
  const funcs = [];
  for (const [destGlob, sourceGlobs] of Object.entries(sourceDestGlobs)) {
    sourceGlobs.forEach((sourceGlob) => {
      funcs.push(PIPES.html(sourceGlob, destGlob));
    });
  }
  return funcs;
})(BUILDFILES.html));

// if (BUILDFUNCS_HTML.length) {
//   BUILDFUNCS.html = series(cleanDestGlob("./dist/betterangels/templates"), parallel(...BUILDFUNCS_HTML));
//   DEFAULTBUILDFUNCS.push(BUILDFUNCS.html);
// }
// #endregion ▄▄▄▄▄ HTML ▄▄▄▄▄
// #region ████████ ASSETS: Copying Assets to Dist ████████ ~
BUILDFUNCS.assets = parallel(...((sourceDestGlobs) => {
  const funcs = [];
  for (const [destGlob, sourceGlobs] of Object.entries(sourceDestGlobs)) {
    sourceGlobs.forEach((sourceGlob) => funcs.push(PIPES.toDest(sourceGlob, destGlob)));
  }
  return funcs;
})(BUILDFILES.assets));

// if (BUILDFUNCS_ASSETS.length) {
//   BUILDFUNCS.assets = series(cleanDestGlob("./dist/betterangels/assets"), parallel(...BUILDFUNCS_ASSETS));
//   DEFAULTBUILDFUNCS.push(BUILDFUNCS.assets);
// }
// #endregion ▄▄▄▄▄ ASSETS ▄▄▄▄▄

// #region ████████ WATCH: Watch Tasks to Fire On File Update ████████ ~

BUILDFUNCS.watch = function watchUpdates() {
  for (const [type, globs] of Object.entries(BUILDFILES)) {
    Object.values(globs ?? {}).forEach((glob) => watch(glob, BUILDFUNCS[type]));
  }
  // watch("scss/**/*.scss", WATCHFUNCS.css);
};
// DEFAULTBUILDFUNCS.push(watchUpdates);
// #endregion ▄▄▄▄▄ WATCH ▄▄▄▄▄

// #region ▒░▒░▒░▒[EXPORTS]▒░▒░▒░▒ ~
BUILDSERIES.push(
  parallel(...Object.values(BUILDFUNCS)),
  BUILDFUNCS.watch
);
exports.default = series(...BUILDSERIES);
// #endregion ▒▒▒▒[EXPORTS]▒▒▒▒
