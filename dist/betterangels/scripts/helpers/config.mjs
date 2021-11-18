/* ****▌███████████████████████████████████████████████████████████████████████████▐**** *\
|*     ▌███████░░░░░░░░░░░░░░ Better Angels for Foundry VTT ░░░░░░░░░░░░░░░░███████▐     *|
|*     ▌██████████████████░░░░░░░░░░░░░ by Eunomiac ░░░░░░░░░░░░░██████████████████▐     *|
|*     ▌█████████████████████ MIT License █ v0.0.1-prealpha █  ████████████████████▐     *|
|*     ▌████████░░░░░░░░ https://github.com/Eunomiac/betterangels ░░░░░░░░█████████▐     *|
\* ****▌███████████████████████████████████████████████████████████████████████████▐**** */

export default {
	minFuzzyMatchScore: 0.8, // Determines strictness of FuzzyMatcher
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
		insightful: "nurture",
		knowledge: "espionage",
		nurture: "corruption",
		open: "sly",
		patient: "cunning",
		sly: "open"
	}
};