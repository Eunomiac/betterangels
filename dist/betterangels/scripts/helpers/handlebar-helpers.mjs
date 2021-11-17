/* ****▌███████████████████████████████████████████████████████████████████████████▐**** *\
|*     ▌███████░░░░░░░░░░░░░░ Better Angels for Foundry VTT ░░░░░░░░░░░░░░░░███████▐     *|
|*     ▌██████████████████░░░░░░░░░░░░░ by Eunomiac ░░░░░░░░░░░░░██████████████████▐     *|
|*     ▌█████████████████████ MIT License █ v0.0.1-prealpha █  ████████████████████▐     *|
|*     ▌████████░░░░░░░░ https://github.com/Eunomiac/betterangels ░░░░░░░░█████████▐     *|
\* ****▌███████████████████████████████████████████████████████████████████████████▐**** */

const HELPERS = {
	"for": (n, options) => {
		const results = [];
		const data = Handlebars.createFrame(options.data);
		for (let i = 0; i < n; i++) {
			data.index = i;
			try {
				results.push(options.fn(i, {data}));
			} catch {
				results.push(`Bad For at ${i} of ${n}`);
			}
		}
		return results.join("");
	},
	"count": (val) => Object.values(val ?? {})?.length ?? 0
};

export default async () => Handlebars.registerHelper(HELPERS);