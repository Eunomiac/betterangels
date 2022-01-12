/* ****▌███████████████████████████████████████████████████████████████████████████▐**** *\
|*     ▌███████░░░░░░░░░░░░░░ Better Angels for Foundry VTT ░░░░░░░░░░░░░░░░███████▐     *|
|*     ▌██████████████████░░░░░░░░░░░░░ by Eunomiac ░░░░░░░░░░░░░██████████████████▐     *|
|*     ▌█████████████████████ MIT License █ v0.0.1-prealpha █  ████████████████████▐     *|
|*     ▌████████░░░░░░░░ https://github.com/Eunomiac/betterangels ░░░░░░░░█████████▐     *|
\* ****▌███████████████████████████████████████████████████████████████████████████▐**** */

export default {
	systemname: "betterangels",
	strategies: ["cunning", "patient", "sly", "open", "devious", "insightful"],
	tactics: ["greed", "generosity", "espionage", "knowledge", "cruelty", "courage", "contempt", "endurance", "corruption", "nurture", "deceit", "honesty"],
	traitPairs: {
		contempt: "endurance",
		corruption: "nurture",
		courage: "cruelty",
		cruelty: "courage",
		cunning: "patient",
		deceit: "honesty",
		devious: "insightful",
		endurance: "contempt",
		espionage: "knowledge",
		generosity: "greed",
		greed: "generosity",
		honesty: "deceit",
		insightful: "devious",
		knowledge: "espionage",
		nurture: "corruption",
		open: "sly",
		patient: "cunning",
		sly: "open"
	},
	virtuousTraitPairs: {
		courage: "cruelty",
		endurance: "contempt",
		generosity: "greed",
		honesty: "deceit",
		insightful: "devious",
		knowledge: "espionage",
		nurture: "corruption",
		open: "sly",
		patient: "cunning"
	},
	sinisterTraitPairs: {
		contempt: "endurance",
		corruption: "nurture",
		cruelty: "courage",
		cunning: "patient",
		deceit: "honesty",
		devious: "insightful",
		espionage: "knowledge",
		greed: "generosity",
		sly: "open"
	},
	get html() {
		const C = this;
		return {
			colors: {
				fg: "rgb(179, 179, 179)",
				fgBright: "rgb(255, 255, 255)",
				fgDim: "rgb(128, 128, 128)",
				bg: "rgb(34, 34, 34)",
				bgDark: "rgb(0, 0, 0)",
				filling: "rgb(0, 255, 0)",
				fillingDark: "rgb(0, 128, 0)",
				emptying: "rgb(255, 0, 0)",
				emptyingDark: "rgb(128, 0, 0)"
			},
			get dots() {
				return {
					backgrounds: {
						empty: "transparent",
						full: `radial-gradient(ellipse, ${C.html.colors.fgBright}, ${C.html.colors.fgDim} 70%)`,
						filling: `radial-gradient(ellipse, ${C.html.colors.filling}, ${C.html.colors.fillingDark} 70%)`,
						emptying: `radial-gradient(ellipse, ${C.html.colors.emptying}, ${C.html.colors.emptyingDark} 70%)`
					}
				};
			}
		};
	}
};