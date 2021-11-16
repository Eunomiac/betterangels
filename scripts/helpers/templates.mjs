const getPath = (fileTitle, subPath) => `/systems/betterangels/templates/${subPath}/${fileTitle}.hbs`
	.replace(/(\..{2,})\.hbs$/, "$1").split(/[\\/]+/).join("/");
const TEMPLATES = {
	actorSections: [  // Actor Character Sheet Sections
		"actor-human",
		"actor-demon",
		"actor-assets",
		"actor-notes"
	].map((title) => getPath(title, "actor/sections")),
	actorPartials: [  // Actor Partials
		"dot-grid"
	].map((title) => getPath(title, "actor/parts"))
};

export default async () => loadTemplates([
	...TEMPLATES.actorSections,
	...TEMPLATES.actorPartials
]);