// #region ████████ CONFIGURATION: Define Parsing Behavior ████████
const CURRENTVERSION = "0.0.1-prealpha";
const BUILDMAP = { // Source and Destination globs defining files to build.
    js: {
        "./dist/module": ["module/**/*.mjs"],
        "./dist/lib": ["lib/**/*.mjs", "lib/**/*.js", "lib/**/*.jsx"]
    },
    css: {
        "./dist/css/": ["scss/**/*.scss"],
        "./css/": ["scss/**/*.scss"],
        "./dist/lib": ["lib/**/*.scss", "lib/**/*.css"]
    },
    html: {
        "./dist/templates": []
    }
};
const REGEXPPATTERNS = { // [searchPattern, replacePattern = ""] params to run .replace() on all files of given type
    js: [
        [                                       // Insert date and version info into file headers
            /^\|\* {5}▌█+v@@VERSION@@█+@@DATE@@█+.*?$/gmu,
            (match) => {
                const subStrs = `|*     ▌██ v${currentVersionInfo.version} ██ ${currentVersionInfo.date} ██▐     *|`.split(/█/u);
                const lengthDiff = match.length - subStrs.join("").length;
                subStrs[1] = "█".repeat(Math.floor((lengthDiff - 2) / 2));
                subStrs[3] = "█".repeat(2 + (lengthDiff % 2));
                [, subStrs[5]] = subStrs;
                return subStrs.join("");
            }
        ],
        [/\n?\s*\/\*(~|\*)(.|\n)*?\*\/\n?/gs],          // Strip multi-line comments of forms '/*~ ... */' or '/** ... */'
        [/\n?\s*\/\*DB\*\/(.|\n)*?\/\*!DB\*\/\n?/gs],   // Strip code between '/*DB*/' and '/*!DB*/' (i.e. debug code)
        [/\n? *\/\/~.*?\n/gs, "\n"],                    // Strip single-line comments of form '//~ ...'
        [/\s*\/\/\s*[a-z]*lint.*$/gm],          // Strip single-line linting directives
        [/\s*\/\*\s*[a-z]*lint[^*]*\*\/\s*/g],  // Strip multi-line linting directives
        [/\s*\/\/ no default.*$/gm],            // Strip '// no default' (used for linting validation)
        [/\s*\/\/ falls through.*$/gm],         // Strip '// falls through' (used for linting validation)
        [/\s*~$/gm],                            // Strip '~' from ends-of-lines (used for automatic region folding)
        [/#reg.*? /gs],                         // Convert 'region' headers to standard headers
        [/^\s*\/\/\s*#endreg.*$/gm, "\n"],      // Strip region footers
        [/(^[ \t]*\r?\n[ \t]*$){2,}/gm, "\n"],  // Strip excess blank lines
        [/\s+$/gm],                             // Trim whitespace from end of lines
        [/\s*\n$/g],                            // Trim whitespace from end of files
        [/^\s*\n/g]                             // Trim whitespace from start of files
    ]
};
// #endregion ▄▄▄▄▄ CONFIGURATION ▄▄▄▄▄

// #region ▒░▒░▒░▒[INITIALIZATION]▒░▒░▒░▒ ~
const {src, dest, series, parallel, watch} = require("gulp");
const prefix = require("gulp-autoprefixer");
const replacer = require("gulp-replace");
const sass = require("gulp-sass")(require("node-sass"));

const currentVersionInfo = {
    version: CURRENTVERSION,
    date: new Date().toString().match(/\b[A-Z][a-z]+ \d+ \d+/).shift()
};
const [BUILDFUNCS, WATCHFUNCS] = [[], []];
// #endregion ▒▒▒▒[INITIALIZATION]▒▒▒▒

// #region ████████ JS: Compiling Javascript ████████ ~
const BUILDFUNCS_JS = ((sourceDestGlobs) => {
    const compiledJSFuncs = [];
    for (const [destGlob, sourceGlobs] of Object.entries(sourceDestGlobs)) {
        for (const sourceGlob of sourceGlobs) {
            console.log(`Compiling source: ${sourceGlob} to dest: ${destGlob}`);
            compiledJSFuncs.push(() => REGEXPPATTERNS.js
                .reduce((gulper, [searchPat, replacePat = ""]) => gulper.pipe(replacer(searchPat, replacePat)), src(sourceGlob))
                .pipe(dest(destGlob)));
        }
    }
    return compiledJSFuncs;
})(BUILDMAP.js);

if (BUILDFUNCS_JS.length) {
    const buildFuncs = series(...BUILDFUNCS_JS);
    BUILDFUNCS.push(buildFuncs);
    Object.values(BUILDMAP.js).forEach((sourceGlob) => WATCHFUNCS.push([sourceGlob, buildFuncs]));
}
// #endregion ▄▄▄▄▄ JS ▄▄▄▄▄
// #region ████████ CSS: Compiling CSS ████████ ~
const BUILDFUNCS_CSS = ((sourceDestGlobs) => {
    const compiledCSSFuncs = [];
    for (const [destGlob, sourceGlobs] of Object.entries(sourceDestGlobs)) {
        for (const sourceGlob of sourceGlobs) {
            compiledCSSFuncs.push(
                () => src(sourceGlobs)
                    .pipe(sass({outputStyle: "expanded"})
                        .on("error", function reportError(err) { console.log(err.toString()); this.emit("end") }))
                    .pipe(prefix({cascade: false}))
                    .pipe(dest(destGlob))
            );
        }
    }
    return compiledCSSFuncs;
})(BUILDMAP.css);

if (BUILDFUNCS_CSS.length) {
    const buildFuncs = series(...BUILDFUNCS_CSS);
    BUILDFUNCS.push(buildFuncs);
    Object.values(BUILDMAP.css).forEach((sourceGlob) => WATCHFUNCS.push([sourceGlob, buildFuncs]));
}
// #endregion ▄▄▄▄▄ CSS ▄▄▄▄▄
// #region ████████ HTML: Compiling HTML ████████ ~
const BUILDFUNCS_HTML = ((sourceDestGlobs) => {
    const compiledHTMLFuncs = [];
    for (const [destGlob, sourceGlobs] of Object.entries(sourceDestGlobs)) {
        for (const sourceGlob of sourceGlobs) {
            compiledHTMLFuncs.push(() => src(sourceGlobs)
                .pipe(sass({outputStyle: "expanded"})
                    .on("error", function reportError(err) { console.log(err.toString()); this.emit("end") }))
                .pipe(prefix({cascade: false}))
                .pipe(dest(destGlob)));
        }
    }
    return compiledHTMLFuncs;
})(BUILDMAP.html);

if (BUILDFUNCS_HTML.length) {
    const buildFuncs = series(...BUILDFUNCS_HTML);
    BUILDFUNCS.push(buildFuncs);
    Object.values(BUILDMAP.html).forEach((sourceGlob) => WATCHFUNCS.push([sourceGlob, buildFuncs]));
}
// #endregion ▄▄▄▄▄ HTML ▄▄▄▄▄
// #region ████████ WATCH: Watch Tasks to Fire On File Update ████████ ~
function watchUpdates() {
    WATCHFUNCS.forEach(([sourceGlob, funcs]) => watch(sourceGlob, funcs));
}
// #endregion ▄▄▄▄▄ WATCH ▄▄▄▄▄

// #region ▒░▒░▒░▒[EXPORTS]▒░▒░▒░▒ ~
exports.default = series(...BUILDFUNCS, watchUpdates);
exports.build = series(...BUILDFUNCS);
exports.watch = watchUpdates;
// #endregion ▒▒▒▒[EXPORTS]▒▒▒▒
