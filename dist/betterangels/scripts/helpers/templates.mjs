/* ****▌███████████████████████████████████████████████████████████████████████████▐**** *\
|*     ▌███████░░░░░░░░░░░░░░ Better Angels for Foundry VTT ░░░░░░░░░░░░░░░░███████▐     *|
|*     ▌██████████████████░░░░░░░░░░░░░ by Eunomiac ░░░░░░░░░░░░░██████████████████▐     *|
|*     ▌█████████████████████ MIT License █ v0.0.1-prealpha █  ████████████████████▐     *|
|*     ▌████████░░░░░░░░ https://github.com/Eunomiac/betterangels ░░░░░░░░█████████▐     *|
\* ****▌███████████████████████████████████████████████████████████████████████████▐**** */

const getPath = (fileTitle, subPath) => `/systems/betterangels/templates/${subPath}/${fileTitle}.html`
	.replace(/(\..{2,})\.html$/, "$1").split(/[\\/]+/).join("/");
const TEMPLATES = {
	actorPartials: [  // Actor Partials
		"actor-human",
		"actor-demon",
		"actor-assets",
		"actor-notes"
	].map((title) => getPath(title, "actor/parts")),
	dragCircle: getPath("dragCircle", "game")
};

export default async () => loadTemplates([
	...TEMPLATES.actorPartials
]);