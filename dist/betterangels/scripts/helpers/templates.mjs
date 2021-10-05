/* ****▌███████████████████████████████████████████████████████████████████████████▐**** *\
|*     ▌███████░░░░░░░░░░░░░░ Better Angels for Foundry VTT ░░░░░░░░░░░░░░░░███████▐     *|
|*     ▌██████████████████░░░░░░░░░░░░░ by Eunomiac ░░░░░░░░░░░░░██████████████████▐     *|
|*     ▌███████████████ MIT License █ v0.0.1-prealpha █ Oct 05 2021 ███████████████▐     *|
|*     ▌████████░░░░░░░░ https://github.com/Eunomiac/betterangels ░░░░░░░░█████████▐     *|
\* ****▌███████████████████████████████████████████████████████████████████████████▐**** */

const getPath = (fileTitle, subPath) => `/systems/betterangels/templates/${subPath}/${fileTitle}.html`
  .replace(/(\..{2,})\.html$/, "$1").split(/[\\/]+/).join("/");
const TEMPLATES = {
  actorPartials: [  // Actor Partials
    "actor-background",
    "actor-equipment",
    "actor-powers",
    "actor-strats&tacts"
  ].map((title) => getPath(title, "actor/parts")),
  dragCircle: getPath("dragCircle", "game")
};

export default async () => loadTemplates([
  ...TEMPLATES.actorPartials
]);