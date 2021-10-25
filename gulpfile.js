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
    "./dist/betterangels/scripts/": ["scripts/**/*.mjs", "scripts/**/*.js"]
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
    [/(\r?\n?)[ \t]*\/\*DEVCODE\*\/(?:.|\r?\n)*?\/\*!DEVCODE\*\/(\r?\n?)/gs, "$1$2"], // Strip developer code
    [/\/\* \*{4}▌.*?▐\*{4} \*\//s, padHeaderLines], // Pad header lines to same length
    [/(\r?\n?)[ \t]*\/\*[*~](?:.|\r?\n|\r)*?\*\/[ \t]*(\r?\n?)/g, "$1$2"], // Strip multi-line comments beginning with '/*~' or '/**'
    [/(\r?\n?)[ \t]*\/\/~.*?$/gm, "$1"], // Strip single-line comments beginning with '//~'
    [/[ \t]*\/\/[ \t]*eslint.*$/gm, ""], // Strip eslint enable/disable single-line comments
    [/[ \t]*\/\*[ \t]*eslint[^*]*\*\/[ \t]*/g, ""], // Strip eslint enable/disable mult-line comments
    [/[ \t]*\/\/ no default.*$/gm, ""], // Strip '// no default'
    [/[ \t]*\/\/ falls through.*$/gm, ""], // Strip '// falls through'
    [/[ \t]*~$/gm, ""], // Strip '~' from end-of-lines (used for automatic region folding)
    [/#reg.*? /gs, ""], // Convert region headers to standard headers
    [/(\r?\n?)[ \t]*\/\/ #endreg.*[ \t]*\r?\n?/g, "\r\n"], // Remove region footers
    [/(\r?\n[ \t]*(?=\r?\n)){2,}/g, "\r\n"], // Strip excess blank lines
    [/[ \t]*\r?\n$/g, ""], // Strip whitespace from end of files
    [/^[ \t]*\r?\n/g, ""] // Strip whitespace from start of files
  ],
  html: []
};
const PIPES = {
  init: function initDist(done) {
    try { cleaner.sync(["./dist/"]) } catch (err) { console.info("Dist folder already empty.") }
    return done();
  },
  watch: function watchUpdates() {
    for (const [type, globs] of Object.entries(BUILDFILES)) {
      Object.values(globs ?? {}).forEach((glob) => watch(glob, BUILDFUNCS[type]));
    }
  },
  jsFull: (source, destination) => function pipeFullJS() {
    return REGEXPPATTERNS.js
      .reduce(
        (pipeline, replacerArgs) => pipeline.pipe(replacer(...replacerArgs)),
        src(source)
          .pipe(plumber(function reportError(err) {
            console.log("*** GULP TASK ERROR ***");
            console.log(err);
            this.emit("end");
          }))
          .pipe(header(BANNERS.js.full, {"package": packageJSON}))
      )
      .pipe(dest(destination));
  },
  jsMin: (source, destination) => function pipeMinJS() {
    return REGEXPPATTERNS.js
      .reduce(
        (pipeline, replacerArgs) => pipeline.pipe(replacer(...replacerArgs)),
        src(source).pipe(plumber(function reportError(err) {
          console.log("*** GULP TASK ERROR ***");
          console.log(err);
          this.emit("end");
        }))
      )
      .pipe(renamer({suffix: ".min"}))
      // .pipe(terser({
      //   parse: {},
      //   compress: {},
      //   mangle: {
      //     properties: {}
      //   },
      //   format: {},
      //   sourceMap: {},
      //   ecma: 2019,

      //   module: true
      // }))
      .pipe(header(BANNERS.js.min, {"package": packageJSON}))
      .pipe(dest(destination));
  },
  cssFull: (source, destination) => function pipeFullCSS() {
    return src(source)
      // .pipe(plumber(function reportError(err) {
      //   console.log("*** GULP TASK ERROR ***");
      //   console.log(err);
      //   this.emit("end");
      // }))
      .pipe(sasser({outputStyle: "nested"}))
      .pipe(bundler([
        prefixer({cascade: false})
      ]))
      .pipe(dest(destination));
  },
  cssMin: (source, destination) => function pipeMinCSS() {
    return src(source)
      // .pipe(plumber(function reportError(err) {
      //   console.log("*** GULP TASK ERROR ***");
      //   console.log(err);
      //   this.emit("end");
      // }))
      .pipe(sasser({outputStyle: "compressed"}))
      .pipe(bundler([
        prefixer({cascade: false}),
        minifier()
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
const plumber = require("gulp-plumber");

const cleaner = require("del");
const renamer = require("gulp-rename");
const header = require("gulp-header");
const replacer = require("gulp-replace");

const terser = require("gulp-terser");

const sasser = require("gulp-sass")(require("node-sass"));
const bundler = require("gulp-postcss");
const prefixer = require("autoprefixer");
const minifier = require("cssnano");

const packageJSON = require("./package");

const BANNERS = {
  js: {...BANNERTEMPLATE},
  css: {...BANNERTEMPLATE}
};

const BUILDFUNCS = {};
// #endregion ▒▒▒▒[INITIALIZATION]▒▒▒▒

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
// #endregion ▄▄▄▄▄ HTML ▄▄▄▄▄

// #region ████████ ASSETS: Copying Assets to Dist ████████ ~
BUILDFUNCS.assets = parallel(...((sourceDestGlobs) => {
  const funcs = [];
  for (const [destGlob, sourceGlobs] of Object.entries(sourceDestGlobs)) {
    sourceGlobs.forEach((sourceGlob) => funcs.push(PIPES.toDest(sourceGlob, destGlob)));
  }
  return funcs;
})(BUILDFILES.assets));
// #endregion ▄▄▄▄▄ ASSETS ▄▄▄▄▄

// #region ▒░▒░▒░▒[EXPORTS]▒░▒░▒░▒ ~
exports.default = series(
  PIPES.init,
  parallel(...Object.values(BUILDFUNCS)),
  PIPES.watch
);
// #endregion ▒▒▒▒[EXPORTS]▒▒▒▒
