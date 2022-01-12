// #region ████████ IMPORTS ████████ ~
import {
	// #region ▮▮▮▮▮▮▮[External Libraries]▮▮▮▮▮▮▮ ~
	gsap, Dragger, InertiaPlugin, MotionPathPlugin, GSDevTools, // GreenSock Animation Platform
	// #endregion ▮▮▮▮[External Libraries]▮▮▮▮
	// #region ▮▮▮▮▮▮▮[Utility]▮▮▮▮▮▮▮ ~
	U,
	// #endregion ▮▮▮▮[Utility]▮▮▮▮
	// #region ▮▮▮▮▮▮▮[XCircles]▮▮▮▮▮▮▮ ~
	XElem,
	XCircle,
	XItem, XDie, XSnap
	// #endregion ▮▮▮▮[XCircles]▮▮▮▮
} from "./bundler.mjs";
// #endregion ▄▄▄▄▄ IMPORTS ▄▄▄▄▄

const TESTCIRCLES = {
	zeroed: [0, 0],
	center: [375, 414],
	topLeft: [100, 100],
	topRight: [1370, 100],
	left: [100, 414],
	right: [1370, 414],
	botLeft: [100, 729],
	botRight: [1370, 729]
};
export default class {
	constructor(circles) {
		[this._DBCONTAINER] = $("<div id=\"dbContainer\" class=\"db x-container\" />").appendTo(".vtt.game");
		// this.generateCircles(circles);
		this.toggleDiceShowSlot(true);
	}
	get DBCONTAINER() { return this._DBCONTAINER }

	setDBCircle(circle) { this.CIRC = circle }
	setDBDie(die) {
		if (this.DIE) {
			this.DIE.$.removeClass("db-flagged");
		}
		die.$.addClass("db-flagged");
		this.DIE = die;
	}

	dbShow() {
		this.isShowingAnglesFor.forEach(this.showAngles);
		this.showDisplay();
	}
	dbHide() {
		this.isShowingAnglesFor.forEach(this.hideAngles);
		this.hideDisplay();
		// this._isDBActive = false;
	}

	// #region ████████ Test Circle Generation: Creating XCircles & Populating with XDice ████████ ~
	generateCircles(circles = {center: 5}) {
		window.CIRCLES = window.CIRCLES ?? [];
		const circleTyper = U.makeCycler(Object.values(XCircle.TYPES).slice(-3));
		const newCircles = [];
		for (const [circlePos, numDice] of Object.entries(circles)) {
			const thisCircle = new XCircle(...TESTCIRCLES[circlePos], 100, {type: circleTyper.next().value});
			thisCircle.createDice(numDice);
			window.CIRCLES.push(thisCircle);
		}
	}
	// #endregion ▄▄▄▄▄ Test Circle Generation ▄▄▄▄▄

	// #region ████████ SHOW ANGLES: Showing Angles & Path Positions Along XCircles ████████ ~
	get isShowingAnglesFor() { return (this._isShowingAngles = this._isShowingAngles ?? []) }
	getStraightenFunc(circle) {
		return {
			[`${circle.id}Straightener`]() {
				gsap.set(`#${circle.id} .db.angle-marker`, {rotation: -1 * circle.rotation});
			}
		}[`${circle.id}Straightener`];
	}
	showAnglesFor(circle) {
		if (!this.isShowingAnglesFor.includes(circle)) {
			this.isShowingAnglesFor.push(circle);
			this.showAngles(circle);
		}
	}
	hideAnglesFor(circle) {
		this._isShowingAngles = this.isShowingAnglesFor.filter((circ) => circ.name !== circle.name);
		this.hideAngles(circle);
	}
	showAngles(circle, numGuides = 4, isShowingAll = false) {
		[circle._dbAngleContainer] = $(`
    <svg height="100%" width="100%">
      <path id="db-${circle.id}" class="db snap-circle" fill="none" stroke="none" d="${U.drawCirclePath(circle.radius * 1.25, {x: circle.radius, y: circle.radius})}"></path>
    </svg>
    `).appendTo(this.DBCONTAINER);
		gsap.set(circle._dbAngleContainer, {xPercent: -50, yPercent: -50, x: circle.x, y: circle.y});
		circle._dbAnglePath = MotionPathPlugin.getRawPath(`#db-${circle.id}`);
		MotionPathPlugin.cacheRawPathMeasurements(circle._dbAnglePath);
		const makeMarker = (ang) => {
			circle.angleGuide = circle.angleGuide ?? {};
			const pathPos = Math.round(100 * gsap.utils.normalize(-180, 180, ang)) / 100;
			const {x, y, angle: pathAngle} = MotionPathPlugin.getPositionOnPath(circle._dbAnglePath, pathPos, true);
			[circle.angleGuide[ang]] = $(`<div class="db angle-marker">${parseInt(pathAngle)}<br>${pathPos}</div>`)
				.appendTo(circle.elem);
			gsap.set(circle.angleGuide[ang], {x, y, xPercent: -50, yPercent: -50, rotation: -1 * circle.rotation});
		};
		this.hideAngles(circle);
		[...Array(numGuides)]
			.map((_, i) => gsap.utils.mapRange(0, numGuides, -180, 180, i))
			.forEach((angle) => makeMarker(angle));
		circle._dbAngleStraightener = this.getStraightenFunc(circle);
		gsap.ticker.add(circle._dbAngleStraightener);
	}
	hideAngles(circle) {
		gsap.ticker.remove(circle._dbAngleStraightener);
		$(`#${circle.id} .angle-marker`).remove();
	}
	// #endregion ▄▄▄▄▄ SHOW ANGLES ▄▄▄▄▄

	// #region ████████ XCircles: Testing & Manipulation of XCircles ████████ ~
	swapSlots(slot1, slot2 = 0, circle = null) {
		circle = circle
      ?? (this._dbCircle = this._dbCircle ?? XElem.ALL.find((elem) => elem instanceof XCircle));
		if (circle) {
			[circle.slots[slot1], circle.slots[slot2]] = [circle.slots[slot2], circle.slots[slot1]];
			circle.distributeSlots(10, "expo.out");
		}
	}
	// #endregion ▄▄▄▄▄ XCircles ▄▄▄▄▄

	// #region ████████ XDie: Testing & Manipulation of XDice ████████ ~
	get dieWatchData() { return (this._dieWatchData = this._dieWatchData ?? []) }
	getDieUpdateFunc(circle) {
		const _this = this;
		return {
			[`${circle.id}DieUpdater`]() {
				circle.slots.forEach((item) => {
					if (item instanceof XDie) {
						const innerRows = ["<table class=\"db db-display\">"];
						_this.dieWatchData.forEach((keys) => {
							const rowHTML = ["<tr>"];
							keys.forEach((key) => {
								let val = item[key] ?? val;
								if (typeof val === "number") {
									if (Math.abs(val) < 1) {
										val = `${val < 0 ? "-" : ""}.${U.roundNum(val * 100)}`;
									} else if (Math.abs(val) === 1) {
										val = `${val < 0 ? "-" : ""}1.0`;
									} else {
										val = U.roundNum(val);
									}
								}
								rowHTML.push(`<td class="db db-data" colspan="${3 - keys.length}">${val}</td>`);
							});
							rowHTML.push("</tr>");
							innerRows.push(rowHTML.join(""));
						});
						innerRows.push("</table>");
						item.html = innerRows.join("");
					}
				});
			}
		}[`${circle.id}DieUpdater`];
	}
	toggleDiceShowSlot(isShowingSlot = true) {
		XElem.ALL.filter((item) => item instanceof XDie)
			.forEach((die) => (die.text = isShowingSlot ? die.slot : ""));
	}
	addDieWatch(dieKeys) {
		this.dieWatchData.push([dieKeys].flat());
	}
	showDieData(circle) {
		circle.slots.forEach((item) => {
			if (item instanceof XDie) {
				item.$.addClass("db-display");
			}
		});
		circle._dbDieDataFunc = this.getDieUpdateFunc(circle);
		gsap.ticker.add(circle._dbDieDataFunc);
	}
	hideDieData(circle) {
		circle.slots.forEach((item) => {
			if (item instanceof XDie) {
				item.$.removeClass("db-display");
				item.$.removeClass("db-flagged");
				item.text = item.slot;
			}
		});
		gsap.ticker.remove(circle._dbDieDataFunc);
	}

	// #endregion ▄▄▄▄▄ XDie ▄▄▄▄▄
	// #region ████████ PING: Ping Notification Display ████████ ~
	ping({x, y}, {radius = 20, color = "yellow", contextElem} = {}) {
		const [pingElem] = $(`<svg class="db" height="100%" width="100%">
      <circle cx="${radius}" cy="${radius}" r="${radius}" fill="${color}" stroke="none" />
    </svg>`)
			.appendTo(this.DBCONTAINER)
			.children()
			.last();
		if (contextElem) {
			({x, y} = MotionPathPlugin.convertCoordinates(contextElem, this.DBCONTAINER.elem, {x, y}));
		}
		gsap.set(pingElem, {xPercent: -50, yPercent: -50, transformOrigin: "50% 50%", x, y});
		gsap.to(pingElem, {
			opacity: 1,
			scale: 1,
			startAt: {
				opacity: 0.25,
				scale: 5
			},
			duration: 1,
			ease: "bounce",
			onComplete() {
				gsap.to(pingElem, {
					opacity: 0.5,
					scale: 0.25,
					duration: 10,
					delay: 5,
					ease: "sine"
				});
			}
		});
	}
	pingSnaps() {
		XCircle.SNAPPOINTS.forEach((circle, point) => {
			this.ping(point, {color: circle.type === "basic" ? "lime" : circle.type});
		});
	}
	// #endregion ▄▄▄▄▄ PING ▄▄▄▄▄

	// #region ████████ REPORTS: To-Console Data Reporting ████████ ~
	getPathReport(circle) {
		const pathData = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1].map((pathPos) => {
			const {x, y, angle} = MotionPathPlugin.getPositionOnPath(circle.snap.path, pathPos, true);
			const convCoords = circle.alignLocalPointTo(XElem.CONTAINER, {x, y});
			return {
				pos: {x: parseInt(x), y: parseInt(y)},
				convPos: {x: parseInt(convCoords.x), y: parseInt(convCoords.y)},
				angle: parseInt(angle),
				pathPos
			};
		});
		console.log(pathData);
	}
	// #endregion ▄▄▄▄▄ REPORTS ▄▄▄▄▄
}