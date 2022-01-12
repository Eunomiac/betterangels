const rollDie = () : number => Math.ceil(Math.random() * 10);

function rollPool(poolSize:number, addDice:number[] = []) : number[] {
	return [
		...[...Array(poolSize)].map(rollDie),
		...addDice
	];
}

function findSets(rollResults:number[]) : number[][] {
	const setLine : number[] = ;
	const SETS : SetSpread = new Array(10).fill(new Array(10).fill(0));

	const SETS = new Array(10).fill(new Array(10).fill(0));
	console.log(SETS);


	for (let height = 1; height <= 10; height++) {
		const width : number = rollResults.filter((dieVal) => dieVal === height).length;
		if (width >= 2) {
			SETS[width - 1][height - 1]++;
		}
	}
	return SETS;
}

function getOdds(poolSize:number, setWidth:number|null = null, setHeight:number|null = null, numTrials:number = 100000, lockedDice = []) {
	if ((poolSize + lockedDice.length) < 2) { return 0 }
	let numWithSet = 0, minWidth = 2, maxWidth = 10, minHeight = 1, maxHeight = 10;

	if (typeof setWidth === "number") {
		minWidth = setWidth;
		maxWidth = setWidth;
	} else if (Array.isArray(setWidth)) {
		minWidth = setWidth[0] ?? minWidth;
		maxWidth = setWidth[1] ?? maxWidth;
	}

	if (typeof setHeight === "number") {
		minHeight = setHeight;
		maxHeight = setHeight;
	} else if (Array.isArray(setHeight)) {
		minHeight = setHeight[0] ?? minHeight;
		maxHeight = setHeight[1] ?? maxHeight;
	}

	for (let trial = 0; trial < numTrials; trial++) {
		const allSets = findSets(rollPool(poolSize, lockedDice));
		const setsOfWidth = allSets.slice(minWidth - 1, maxWidth);
		const setsOfHeight = setsOfWidth.map((sets) => sets.slice(minHeight - 1, maxHeight));
		if (setsOfHeight.flat().some((val) => val > 0)) {
			numWithSet++;
		}
	}

	return numWithSet / numTrials;
}

function getCalledShotOdds(poolSize, calledShot = 10, numTrials = 100000) {
	return getOdds(poolSize - 2, null, calledShot, numTrials, [calledShot]);
}

[3, 4, 5, 6, 7, 8, 9, 10].forEach((poolSize) => {
	console.log(`${poolSize} Dice, Calling 10: ${Math.round(getCalledShotOdds(poolSize, 10) * 10000) / 100}% Chance of Set Matching Call`);
});