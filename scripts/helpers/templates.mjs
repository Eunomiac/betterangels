const getPath = (fileTitle, subPath) => `/systems/betterangels/templates/${subPath}/${fileTitle}.hbs`
	.replace(/(\..{2,})\.hbs$/, "$1").split(/[\\/]+/).join("/");
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