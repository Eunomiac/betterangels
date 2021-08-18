const {src, dest, series, parallel, watch} = require("gulp");
const prefix = require("gulp-autoprefixer");
const replacer = require("gulp-replace");
const sass = require("gulp-sass")(require("node-sass"));

const currentVersionInfo = {
    version: "0.0.1-prealpha",
    date: new Date().toString().match(/\b[A-Z][a-z]+ \d+ \d+/).shift()
};

const BUILDFUNCS = {};
const DEFAULTBUILDFUNCS = [];

// #region ████████ JS: Compiling Javascript ████████ ~
const BUILDFILES_JS = {
    "./dist/module": ["module/betterangels.mjs"],
    "./dist/module/documents": ["module/documents/*.mjs"]
};
const regexpReplacePatterns = [
    [
        /^\|\* {5}▌█+v@@VERSION@@█+@@DATE@@█+.*?$/gmu,
        (match) => {
            const subStrs = `|*     ▌██ v${currentVersionInfo.version} ██ ${currentVersionInfo.date} ██▐     *|`.split(/█/u);
            const lengthDiff = match.length - subStrs.join("").length;
            subStrs[1] = "█".repeat(Math.floor((lengthDiff - 2) / 2));
            subStrs[3] = "█".repeat(2 + (lengthDiff % 2));
            [, subStrs[5]] = subStrs;
            return subStrs.join("");
        }
    ], // Insert date and version info into file headers.
    [/\n?\s*\/\*~(.|\n)*?~\*\/\n?/gs, ""], // Strip comment blocks beginning with '/*~'
    [/\n?\s*\/\*\*(.|\n)*?\*\/\n?/gs, ""], // Strip comment blocks beginning with '/**'
    [/\n?\s*\/\/~.*?$/gm, ""], // Strip comments beginning with '//~'
    [/\s*\/\/\s*eslint.*$/gm, ""], // Strip eslint enable/disable single-line comments
    [/\s*\/\*\s*eslint[^*]*\*\/\s*/g, ""], // Strip eslint enable/disable mult-line comments
    [/\s*\/\/ no default.*$/gm, ""], // Strip '// no default'
    [/\s*\/\/ falls through.*$/gm, ""], // Strip '// falls through'
    [/\s*~$/gm, ""], // Strip '~' from end-of-lines (used for automatic region folding)
    [/(\s*\n\s*)+/g, "$1"], // Strip excess blank lines
    [/\s*\n$/g, ""], // Strip whitespace from end of files
    [/^\s*\n/g, ""] //  Strip whitespace from start of files
];

const BUILDFUNCS_JS = ((sourceDestGlobs) => {
    const compiledJSFuncs = [];
    for (const [destGlob, sourceGlobs] of Object.entries(sourceDestGlobs)) {
        for (const sourceGlob of sourceGlobs) {
            compiledJSFuncs.push(() => regexpReplacePatterns
                .reduce((gulper, replaceArgs) => gulper.pipe(replacer(...replaceArgs)), src(sourceGlob))
                .pipe(dest(destGlob)));
        }
    }
    return compiledJSFuncs;
})(BUILDFILES_JS);

if (BUILDFUNCS_JS.length) {
    BUILDFUNCS.js = series(...BUILDFUNCS_JS);
    DEFAULTBUILDFUNCS.push(parallel(BUILDFUNCS.js));
}
// #endregion ▄▄▄▄▄ JS ▄▄▄▄▄

// #region ████████ CSS: Compiling CSS ████████ ~
const BUILDFILES_CSS = {
    "./dist/css/": ["scss/**/*.scss"],
    "./css/": ["scss/**/*.scss"]
};

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
})(BUILDFILES_CSS);

if (BUILDFUNCS_CSS.length) {
    BUILDFUNCS.css = series(...BUILDFUNCS_CSS);
    DEFAULTBUILDFUNCS.push(parallel(BUILDFUNCS.css));
}
// #endregion ▄▄▄▄▄ CSS ▄▄▄▄▄

// #region ████████ HTML: Compiling HTML ████████ ~
const BUILDFILES_HTML = {
    "./dist/templates": []
};

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
})(BUILDFILES_HTML);

if (BUILDFUNCS_HTML.length) {
    BUILDFUNCS.html = series(...BUILDFUNCS_HTML);
    DEFAULTBUILDFUNCS.push(parallel(BUILDFUNCS.html));
}
// #endregion ▄▄▄▄▄ HTML ▄▄▄▄▄

// #region ████████ WATCH TASKS: Watch Tasks to Fire On File Update ████████ ~
function watchUpdates() {
    for (const type of Object.keys(BUILDFUNCS)) {
        switch (type) {
            case "js": {
                for (const sourceGlob of Object.values(BUILDFILES_JS)) {
                    watch(sourceGlob, BUILDFUNCS.js);
                }
                break;
            }
            case "css": {
                for (const sourceGlob of Object.values(BUILDFILES_CSS)) {
                    watch(sourceGlob, BUILDFUNCS.css);
                }
                break;
            }
            case "html": {
                for (const sourceGlob of Object.values(BUILDFILES_HTML)) {
                    watch(sourceGlob, BUILDFUNCS.html);
                }
                break;
            }
            // no default
        }
    }
}
BUILDFUNCS.watch = watchUpdates;
DEFAULTBUILDFUNCS.push(watchUpdates);
// #endregion ▄▄▄▄▄ WATCH TASKS ▄▄▄▄▄

// #region ▒░▒░▒░▒[EXPORTS]▒░▒░▒░▒ ~
exports.default = series(...DEFAULTBUILDFUNCS);
for (const [expType, expFunc] of Object.entries(BUILDFUNCS)) {
    exports[expType] = expFunc;
}
// #endregion ▒▒▒▒[EXPORTS]▒▒▒▒
