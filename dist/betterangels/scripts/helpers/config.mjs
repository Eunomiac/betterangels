/* ****▌███████████████████████████████████████████████████████████████████████████▐**** *\
|*     ▌███████░░░░░░░░░░░░░░ Better Angels for Foundry VTT ░░░░░░░░░░░░░░░░███████▐     *|
|*     ▌██████████████████░░░░░░░░░░░░░ by Eunomiac ░░░░░░░░░░░░░██████████████████▐     *|
|*     ▌█████████████████████ MIT License █ v0.0.1-prealpha █  ████████████████████▐     *|
|*     ▌████████░░░░░░░░ https://github.com/Eunomiac/betterangels ░░░░░░░░█████████▐     *|
\* ****▌███████████████████████████████████████████████████████████████████████████▐**** */

export default {
	minFuzzyMatchScore: 0.8, // Determines strictness of FuzzyMatcher
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
	}
};