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
	}
};

export default async () => Handlebars.registerHelper(HELPERS);