/* ****▌███████████████████████████████████████████████████████████████████████████▐**** *\
|*     ▌███████░░░░░░░░░░░░░░ Better Angels for Foundry VTT ░░░░░░░░░░░░░░░░███████▐     *|
|*     ▌██████████████████░░░░░░░░░░░░░ by Eunomiac ░░░░░░░░░░░░░██████████████████▐     *|
|*     ▌███████████████ MIT License █ v0.0.1-prealpha █ Sep 27 2021 ███████████████▐     *|
|*     ▌████████░░░░░░░░ https://github.com/Eunomiac/betterangels ░░░░░░░░█████████▐     *|
\* ****▌███████████████████████████████████████████████████████████████████████████▐**** */

export default async () => {

  const getPath = (fileTitle, subPath) => `/systems/betterangels/templates/${subPath}/${fileTitle}.html`
    .replace(/(\..{2,})\.html$/, "$1").split(/[\\/]+/).join("/");

  return loadTemplates([
    ...[ // Actor Partials
      "actor-background",
      "actor-equipment",
      "actor-powers",
      "actor-strats&tacts"
    ].map((title) => getPath(title, "actor/parts"))
  ]);
};