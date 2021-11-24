const getPath = (fileTitle, subPath) => `/systems/betterangels/templates/${subPath}/${fileTitle}.hbs`
	.replace(/(\..{2,})\.hbs$/, "$1").split(/[\\/]+/).join("/");
const TEMPLATES = {
	actorSections: [  // Actor Character Sheet Sections
		"actor-front",
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