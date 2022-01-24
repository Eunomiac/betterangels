export default {
	systemname: "betterangels",
	orderedTraits: [
		{name: "greed", type: "tactic", subType: "sinister", opposite: "generosity"},
		{name: "generosity", type: "tactic", subType: "virtuous", opposite: "greed"},
		{name: "cunning", type: "strategy", subType: "sinister", opposite: "patient"},
		{name: "patient", type: "strategy", subType: "virtuous", opposite: "cunning"},
		{name: "espionage", type: "tactic", subType: "sinister", opposite: "knowledge"},
		{name: "knowledge", type: "tactic", subType: "virtuous", opposite: "espionage"},
		{name: "cruelty", type: "tactic", subType: "sinister", opposite: "courage"},
		{name: "courage", type: "tactic", subType: "virtuous", opposite: "cruelty"},
		{name: "sly", type: "strategy", subType: "sinister", opposite: "open"},
		{name: "open", type: "strategy", subType: "virtuous", opposite: "sly"},
		{name: "contempt", type: "tactic", subType: "sinister", opposite: "endurance"},
		{name: "endurance", type: "tactic", subType: "virtuous", opposite: "contempt"},
		{name: "corruption", type: "tactic", subType: "sinister", opposite: "nurture"},
		{name: "nurture", type: "tactic", subType: "virtuous", opposite: "corruption"},
		{name: "devious", type: "strategy", subType: "sinister", opposite: "insightful"},
		{name: "insightful", type: "strategy", subType: "virtuous", opposite: "devious"},
		{name: "deceit", type: "tactic", subType: "sinister", opposite: "honesty"},
		{name: "honesty", type: "tactic", subType: "virtuous", opposite: "deceit"}
	],
	get traits() { return this.orderedTraits.map(({name}) => name) },
	get strategies() { return this.orderedTraits.filter(({type}) => type === "strategy").map(({name}) => name) },
	get tactics() { return this.orderedTraits.filter(({type}) => type === "tactic").map(({name}) => name) },
	get sinister() { return this.orderedTraits.filter(({subType}) => subType === "sinister").map(({name}) => name) },
	get virtuous() { return this.orderedTraits.filter(({subType}) => subType === "virtuous").map(({name}) => name) },
	get traitPairs() { return Object.fromEntries(this.orderedTraits.map(({name, opposite}) => [name, opposite])) },
	get sinisterTraitPairs() {
		return Object.fromEntries(this.orderedTraits.filter(({subType}) => subType === "sinister")
			.map(({name, opposite}) => [name, opposite]));
	},
	get virtuousTraitPairs() {
		return Object.fromEntries(this.orderedTraits.filter(({subType}) => subType === "virtuous")
			.map(({name, opposite}) => [name, opposite]));
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
	menuRadius: {
		strategy: 60,
		tactic: 50
	},
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
				gold: "rgb(255, 215, 0)",
				fg: "rgb(204, 204, 204)",
				fgBright: "rgb(255, 255, 255)",
				fgDim: "rgb(128, 128, 128)",
				bg: "rgb(34, 34, 34)",
				bgDim: "rgb(15, 15, 15)",
				bgDark: "rgb(0, 0, 0)",
				filling: "rgb(0, 255, 0)",
				fillingDark: "rgb(0, 128, 0)",
				emptying: "rgb(255, 0, 0)",
				emptyingDark: "rgb(128, 0, 0)",
				strategy: "rgb(0, 200, 0)",
				tactic: "rgb(200, 0, 200)",
				strategyBright: "rgb(0, 255, 0)",
				tacticBright: "rgb(255, 0, 255)",
				strategyDark: "rgb(0, 100, 0)",
				tacticDark: "rgb(100, 0, 100)",
				addHoverTrigger: "rgb(255, 255, 0)",
				toWidthHoverTrigger: "rgb(0, 255, 255)",
				resetHoverTrigger: "rgb(255, 0, 0)",
				toHeightHoverTrigger: "rgb(0, 255, 0)"
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
			},
			get shadows() {
				return {
					traitShadow: `0 0 0.12em ${this.colors.bgDark})`.repeat(5),
					tacticHover: [
						...[3, 6].map((blur) => `0 0 ${blur}px ${this.colors.fgBright}`),
						...[6, 10, 12, 15].map((blur) => `0 0 ${blur}px ${this.colors.tacticBright}`)
					].join(", "),
					strategyHover: [
						...[3, 6].map((blur) => `0 0 ${blur}px ${this.colors.fgBright}`),
						...[6, 10, 12, 15].map((blur) => `0 0 ${blur}px ${this.colors.strategyBright}`)
					].join(", "),
					bgTraitShadow: `-1px 1px 1px ${this.colors.fgDim}, 1px -1px 1px ${this.colors.bgDark}`,
					dropTarget: [
						...[5, 10].map((blur) => `0 0 ${blur}px ${this.colors.fgBright}`),
						...[10, 15, 20, 25].map((blur) => `0 0 ${blur}px ${this.colors.gold}`)
					].join(", "),
					addHoverTrigger: [
						...[3, 6].map((blur) => `0 0 ${blur}px ${this.colors.fgBright}`),
						...[6, 10, 12, 15].map((blur) => `0 0 ${blur}px ${this.colors.addHoverTrigger}`)
					].join(", "),
					toWidthHoverTrigger: [
						...[3, 6].map((blur) => `0 0 ${blur}px ${this.colors.fgBright}`),
						...[6, 10, 12, 15].map((blur) => `0 0 ${blur}px ${this.colors.toWidthHoverTrigger}`)
					],
					toHeightHoverTrigger: [
						...[3, 6].map((blur) => `0 0 ${blur}px ${this.colors.fgBright}`),
						...[6, 10, 12, 15].map((blur) => `0 0 ${blur}px ${this.colors.toHeightHoverTrigger}`)
					],
					resetHoverTrigger: [
						...[3, 6].map((blur) => `0 0 ${blur}px ${this.colors.fgBright}`),
						...[6, 10, 12, 15].map((blur) => `0 0 ${blur}px ${this.colors.resetHoverTrigger}`)
					]
				};
			}
		};
	}
};