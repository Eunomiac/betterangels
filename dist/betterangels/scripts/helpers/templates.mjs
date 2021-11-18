/* ****▌███████████████████████████████████████████████████████████████████████████▐**** *\
|*     ▌███████░░░░░░░░░░░░░░ Better Angels for Foundry VTT ░░░░░░░░░░░░░░░░███████▐     *|
|*     ▌██████████████████░░░░░░░░░░░░░ by Eunomiac ░░░░░░░░░░░░░██████████████████▐     *|
|*     ▌█████████████████████ MIT License █ v0.0.1-prealpha █  ████████████████████▐     *|
|*     ▌████████░░░░░░░░ https://github.com/Eunomiac/betterangels ░░░░░░░░█████████▐     *|
\* ****▌███████████████████████████████████████████████████████████████████████████▐**** */

const getPath = (fileTitle, subPath) => `/systems/betterangels/templates/${subPath}/${fileTitle}.html`
	.replace(/(\..{2,})\.html$/, "$1").split(/[\\/]+/).join("/");
const TEMPLATES = {
	actorSections: [  // Actor Character Sheet Sections
		"actor-human",
		"actor-demon",
		"actor-assets",
		"actor-notes"
	].map((title) => getPath(title, "actor/sections")),
	actorPartials: [  // Actor Partials
		"radial-menu",
		"trait-grid"
	].map((title) => getPath(title, "actor/parts"))
};

export default async () => loadTemplates([
	...TEMPLATES.actorSections,
	...TEMPLATES.actorPartials
]);