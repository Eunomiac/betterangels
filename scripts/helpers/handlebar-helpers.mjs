import {U} from "./bundler.mjs";

const HELPERS = {
	"for": (targetNum, ...args) => {
		const options = args.pop();
		const startVal = U.pInt(args.shift() ?? 0);
		const stepVal = U.pInt(args.shift() ?? 1);
		const results = [];
		const data = Handlebars.createFrame(options.data);
		for (let i = startVal; stepVal < 0 ? i >= targetNum : i < targetNum; i += stepVal) {
			data.index = i;
			try {
				results.push(options.fn(i, {data}));
			} catch {
				results.push(`Bad For at ${i} of ${targetNum}`);
			}
		}
		return results.join("");
	},
	"count": (val) => Object.values(val ?? {})?.length ?? 0,
	"bundle": (...args) => {
		args.pop();
		const bundle = {};
		while (args.length && args.length % 2 === 0) {
			bundle[args.shift()] = args.shift();
		}
		return bundle;
	},
	"concat": (...args) => args.slice(0, -1).join(" "),
	"case": (...args) => {
		switch (args.shift()) {
			case "upper": return U.uCase(args.shift());
			case "lower": return U.lCase(args.shift());
			case "sentence": return U.sCase(args.shift());
			case "title": return U.tCase(args.shift());
			default: return args.shift();
		}
	},
	"test": (v1, operator, v2) => {
		/* eslint-disable eqeqeq */
		switch (operator) {
			case "==": return v1 == v2;
			case "===": return v1 === v2;
			case "!=": return v1 != v2;
			case "!==": return v1 !== v2;
			case "<": return v1 < v2;
			case "<=": return v1 <= v2;
			case ">": return v1 > v2;
			case ">=": return v1 >= v2;
			case "&&": return v1 && v2;
			case "||": return v1 || v2;
			case "not": return !v1;
			case "in": {
				if (Array.isArray(v2)) { return v2.includes(v1) }
				if (typeof v2 === "object" && Array.isArray(Object.keys(v2))) { return Object.keys(v2).includes(v1) }
				if (["string", "number"].includes(typeof v2)) { return `${v2}`.includes(`${v1}`) }
				return false;
			}
			default: return Boolean(v1);
		}
		/* eslint-enable eqeqeq */
	},
	"math": (v1, operator, v2, options) => {
		switch (operator) {
			case "+": return U.pInt(v1) + U.pInt(v2);
			case "-": return U.pInt(v1) - U.pInt(v2);
			case "++": return U.pInt(v1) + 1;
			case "--": return U.pInt(v1) - 1;
			case "*": return U.pInt(v1) * U.pInt(v2);
			case "/": return U.pInt(U.pFloat(v1) / U.pFloat(v2));
			case "%": return U.pInt(v1) % U.pInt(v2);
			case "**": case "^": return U.pInt(U.pFloat(v1) ** U.pFloat(v2));
			case "min": return Math.max(U.pInt(v1), U.pInt(v2));
			case "max": return Math.min(U.pInt(v1), U.pInt(v2));
			default: return U.pInt(v1);
		}
	}
};

export default async () => Handlebars.registerHelper(HELPERS);