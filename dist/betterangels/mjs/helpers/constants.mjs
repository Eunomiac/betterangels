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
	aspects: {
		"an-utmost-foulness": "An Utmost Foulness",
		"aqua-form": "Aqua-Form",
		"carapace": "Carapace",
		"cloven-hooves": "Cloven Hooves",
		"darkness-shrouded": "Darkness-Shrouded",
		"flame-wreathed": "Flame-Wreathed",
		"ghost-form": "Ghost Form",
		"giant": "Giant",
		"glory": "Glory",
		"hells-engine": "Hell's Engine",
		"horned": "Horned",
		"invisible": "Invisible",
		"legion": "Legion",
		"non-euclidean": "Non-Euclidean",
		"wings": "Wings"
	},
	powers: {
		"alchemy": "Alchemy",
		"animal-form": "Animal Form",
		"armor": "Armor",
		"arrogance": "Arrogance",
		"babel-babble": "Babel Babble",
		"banish": "Banish",
		"body-control": "Body Control",
		"clairvoyance": "Clairvoyance",
		"crime-time": "Crime-Time",
		"dark-ritual": "Dark Ritual",
		"dead-ringer": "Dead Ringer",
		"dominator-strike": "Dominator Strike",
		"false-memories": "False Memories",
		"hanging-curse": "Hanging Curse",
		"impossible-beauty": "Impossible Beauty",
		"ineffable-defense": "Ineffable Defense",
		"oracle": "Oracle",
		"psychic-objects": "Psychic Objects",
		"regeneration": "Regeneration",
		"retrocognition": "Retrocognition",
		"soulless-materialism": "Soulless Materialism",
		"summon": "Summon",
		"telekinesis": "Telekinesis",
		"teleport-self": "Teleport Self",
		"terror": "Terror",
		"that-hideous-strength": "That Hideous Strength",
		"the-evil-eye": "The Evil Eye",
		"wither": "Wither"
	},
	pixelProperties: [
		"x", "y", "top", "left", "height", "width", "margin", "border"
	],
	mobResolve: {
		0.1: "Cowardly (10%)",
		0.25: "Timid (25%)",
		0.33: "Average (33%)",
		0.5: "Fanatic (50%)",
		0.9: "Suicidal (90%)"
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
				emptyingDark: "rgb(128, 0, 0)",
				strategy: "rgb(0, 200, 0)",
				tactic: "rgb(200, 0, 200)"
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