// ████████ INITIALIZATION ████████
import U from "../helpers/utilities.mjs";
import gsap, {
  Draggable as Dragger,
  InertiaPlugin,
  MotionPathPlugin
} from "/scripts/greensock/esm/all.js"; // eslint-disable-line import/no-unresolved

const CALLLOG = [];
let startTime;
const getTime = () => {
  startTime = startTime ?? Date.now();
  return Date.now() - startTime;
};
const log = (funcName, callerName, result, {x, y}) => {
  CALLLOG.push(`${getTime()}: ${funcName}(${parseInt(x)}, ${parseInt(y)}) = ${result} <-- ${callerName}`);
};

MotionPathPlugin.convertToPath("circle");

gsap.set([".roll-circle", ".snap-circle"], {xPercent: -50, yPercent: -50, transformOrigin: "50% 50%"});
gsap.set("#roll-circle-1", {x: 100, y: 100});
gsap.set("#roll-circle-2", {x: 900, y: 100});
gsap.set(".snap-circle", {x: 80, y: 80});

const DICE = [];
const angleDistributor = gsap.utils.distribute({base: 0, amount: 1, from: "start"});

const getDicePositions = (circle, numBlanks = 0, cachedRawPath = undefined) => {
  const dieCoords = {};
  if (!cachedRawPath) {
    cachedRawPath = MotionPathPlugin.getRawPath(`#${circle.id} .snap-circle`);
    MotionPathPlugin.cacheRawPathMeasurements(cachedRawPath);
  }
  const dice = Array.from($(`#${circle.id} .die`));
  const spacedDice = [
    ...new Array(numBlanks).fill(null),
    ...dice,
    null
  ];
  spacedDice.forEach((die, i) => {
    const pathPos = angleDistributor(i + numBlanks, die, spacedDice);
    const {x, y, angle} = MotionPathPlugin.getPositionOnPath(cachedRawPath, pathPos, true);
    dieCoords[die?.id ?? i] = {x, y, angle, pathPos};
  });
  return dieCoords;
};

const distributeDice = (circle, numBlanks, cachedRawPath) => {
  for (const [id, diePos] of Object.entries(getDicePositions(circle, numBlanks, cachedRawPath))) {
    if (/^die/.test(`${id}`)) {
      gsap.set(`#${id}`, {x: diePos.x, y: diePos.y});
    }
  }
};

/* In the RollCircle class, have each circle create an svg snap circle (that rotates with the main circle, plus any other animations) for numDice + 1, so that the snap point (i.e. where the blank spot will open up) is always available to the dragDice snap function. */

/* Also try FLIP ---> It's exactly for reparenting shit. */

const redistributeDice = (circle, toNumBlanks, cachedRawPath) => {
  const curDiePos = getDicePositions(circle, circle.numBlanks ?? 0, cachedRawPath);
  const toDiePos = getDicePositions(circle, toNumBlanks, cachedRawPath);
  for (const [id, {pathPos: curPathPos}] of Object.entries(curDiePos)) {
    if (/^die/.test(`${id}`)) {
      gsap.to(`#${id}`, {
        motionPath: {
          path: `#${circle.id} .snap-circle`,
          // align: "#path",
          alignOrigin: [0.5, 0.5],
          start: curPathPos,
          end: toDiePos[id].pathPos
          // fromCurrent: false,
          // autoRotate: true
        },
        transformOrigin: "50% 50%",
        duration: 0.5,
        ease: "power1.inOut"
      });
    }
  }
  circle.numBlanks = toNumBlanks;
  if (toNumBlanks === 1) {
    circle.blankPathPos = Object.values(toDiePos).shift().pathPos;
  } else {
    delete circle.blankPathPos;
  }
  setTimeout(() => {
    dragDice.forEach((die) => die.update());
  }, 500);
};

const createDice = (numDice, circleNum) => {
  new Array(numDice)
    .fill("")
    .forEach(() => {
      const die = $(`<div id="die-${DICE.length + 1}" class="die">${DICE.length + 1}</div>`).appendTo($(`#roll-circle-${circleNum}`))[0];
      gsap.set(die, {xPercent: -50, yPercent: -50, transformOrigin: "50% 50%"});
      DICE.push(die);
    });
  distributeDice($(`#roll-circle-${circleNum}`)[0], 0);
};

createDice(6, 1);
createDice(6, 2);

const rotateBlanks = () => {
  setTimeout(() => { redistributeDice($("#roll-circle-1")[0], 1) }, 1000);
  setTimeout(() => { redistributeDice($("#roll-circle-1")[0], 0) }, 2000);
  setTimeout(() => { redistributeDice($("#roll-circle-1")[0], 1) }, 3000);
  setTimeout(() => { redistributeDice($("#roll-circle-1")[0], 0) }, 4000);
  setTimeout(rotateBlanks, 5000);
};
// rotateBlanks();

// gsap.to(".roll-circle", {rotation: "+=360", duration: 100, repeat: -1});
// gsap.to(".die", {rotation: "+=360", duration: 100, repeat: -1, runBackwards: true});

const getDistance = ({x: x1, y: y1}, {x: x2, y: y2}) =>
  // Returns the distance between two points.
  Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);

const getClosest = ({x, y}, caller) =>
// Given a point, returns the closest circle to the point.
{
  let minDistance, closestCircle;
  $(".roll-circle").each((i, circle) => {
    const distance = getDistance(
      {x, y},
      {x: gsap.getProperty(circle, "x"), y: gsap.getProperty(circle, "y")}
    );
    if (distance < (minDistance ?? Infinity)) {
      minDistance = distance;
      closestCircle = circle;
    }
  });
  log("getClosest", caller, closestCircle.id, {x: parseInt(x), y: parseInt(y)});
  return closestCircle;
};

// ===== Here's where the problems start! (...I think) =====
const dragDice = Draggable.create(
  ".die",
  {
    type: "x,y",
    inertia: true,
    onDragStart() {
      CALLLOG.length = 0;
      $(this.target).appendTo("#container");
      this.update(false, true);

      // Log the closest circle to the die (i.e. the circle it's starting from)
      this.closestCircle = getClosest(this, "onDragStart");

      // Stop the nearest circle's rotation
      gsap.killTweensOf(this.closestCircle, "rotation");
      dragDice.forEach((die) => die.update());

      // Stop the die's counter-rotation, since it doesn't need it to cancel out the larger circle's rotation anymore
      gsap.killTweensOf(this.target, "rotation");
      gsap.set(this.target, {rotation: 0});
    },
    onDrag() {
      // Constantly update the closest circle to the die as it's moving, rotating it to follow the cursor
      const closestCircle = getClosest(this, "onDrag");
      if (this.closestCircle !== closestCircle) {
        redistributeDice(this.closestCircle, 0);
        // gsap.to(this.closestCircle, {rotation: "+=360", duration: 100, repeat: -1});
        gsap.killTweensOf(closestCircle, "rotation");
        redistributeDice(closestCircle, 1);
        this.closestCircle = closestCircle;
      }
    },
    snap: {
      points(point) {
        // Get the closest circle. (I realize that, by calculating the closest circle in every event listener, I'm obviating the need to log it... but I suspect that something about the way snapping works means I need to log it at some point and not calculate it again here...?)
        this.closestCircle = getClosest(point, "snap");

        // Get the raw path of the closest circle's "snap-circle" (the inner circle with the dashed stroke). It was cached when it was created in the initialization section above, so no need to cache it again.
        const rawPath = MotionPathPlugin.getRawPath(`#snap-circle-${this.closestCircle.id.slice(-1)}`);
        MotionPathPlugin.cacheRawPathMeasurements(rawPath);

        // Get a point on that snap-circle to snap to (I'm just using '0.5' for this demo, but the real logic will figure out the nearest spot between the dice already in orbit, then animate those dice to new positions on the path to create a space for the new die to snap to. You can probably expect another forum post when I inevitably struggle to get that working ;) )
        const snapPoint = MotionPathPlugin.getPositionOnPath(rawPath, this.closestCircle.blankPathPos);
        snapPoint.y += 19;

        this.snapPoint = snapPoint;

        // Convert the snap point to the #container coordinate space, where the dragged die is currently
        const convSnapPoint = MotionPathPlugin.convertCoordinates($(`#${this.closestCircle.id}`)[0], $("#container")[0], snapPoint);

        this.convSnapPoint = convSnapPoint;

        CALLLOG.push(`SNAP --> Path: ${parseInt(snapPoint.x)}, ${parseInt(snapPoint.y)} ... Converted: ${parseInt(convSnapPoint.x)}, ${parseInt(convSnapPoint.y)}`);
        CALLLOG.push(`... Blank Path Pos: ${this.closestCircle.blankPathPos}`);

        return convSnapPoint;
      }
    },
    onThrowUpdate() {
      // Continue to update the closest circle to the die as it's moving. (I tried using 'endX'/'endY' here, but it didn't work --- I think 'endX'/'endY' are being calculated after the snapping has been applied, but I need to figure out the circle *to* snap to at this point.)
      const closestCircle = getClosest(this, "onDrag");
      if (this.closestCircle !== closestCircle) {
        redistributeDice(this.closestCircle, 0);
        // gsap.to(this.closestCircle, {rotation: "+=360", duration: 100, repeat: -1});
        gsap.killTweensOf(closestCircle, "rotation");
        redistributeDice(closestCircle, 1);
        this.closestCircle = closestCircle;
      }
      // this.closestCircle = getClosest(point, "onThrowUpdate");
    },
    onThrowComplete(point) {
      // Convert the die's current location to the coordinate space of its new home circle
      const convertCoords = MotionPathPlugin.convertCoordinates($("#container")[0], $(`#${this.closestCircle.id}`)[0], this);
      // convertCoords.y -= 200;

      const logCVs = {
        basic: MotionPathPlugin.convertCoordinates($("#container")[0], $(`#${this.closestCircle.id}`)[0], this),
        target: MotionPathPlugin.convertCoordinates($("#container")[0], $(`#${this.closestCircle.id}`)[0], {x: gsap.getProperty(this.target, "x"), y: gsap.getProperty(this.target, "y")}),
        point: MotionPathPlugin.convertCoordinates($("#container")[0], $(`#${this.closestCircle.id}`)[0], point),
        end: MotionPathPlugin.convertCoordinates($("#container")[0], $(`#${this.closestCircle.id}`)[0], {x: this.endX, y: this.endY}),
        snap: MotionPathPlugin.convertCoordinates($("#container")[0], $(`#${this.closestCircle.id}`)[0], {x: this.snapPoint.x, y: this.snapPoint.y}),
        csnap: MotionPathPlugin.convertCoordinates($("#container")[0], $(`#${this.closestCircle.id}`)[0], {x: this.convSnapPoint.x, y: this.convSnapPoint.y})
      };

      CALLLOG.push(...[
        "==== COMPLETE ====",
        `= THIS:     ${parseInt(this.x)}, ${parseInt(this.y)}`,
        `= THIS.TRG: ${parseInt(gsap.getProperty(this.target, "x"))}, ${parseInt(parseInt(gsap.getProperty(this.target, "y")))}`,
        `= POINT:    ${parseInt(point.x)}, ${parseInt(point.y)}`,
        `= THIS.END: ${parseInt(this.endX)}, ${parseInt(this.endY)}`,
        `= THIS.SNP: ${parseInt(this.snapPoint.x)}, ${parseInt(this.snapPoint.y)}`,
        `= THIS.C-S: ${parseInt(this.convSnapPoint.x)}, ${parseInt(this.convSnapPoint.y)}`,
        `==== CONVERT: #container --> #${this.closestCircle.id}`,
        `= THIS:     ${parseInt(logCVs.basic.x)}, ${parseInt(logCVs.basic.y)}`,
        `= THIS.TRG: ${parseInt(logCVs.target.x)}, ${parseInt(logCVs.target.y)}`,
        `= POINT:    ${parseInt(logCVs.point.x)}, ${parseInt(logCVs.point.y)}`,
        `= THIS.END: ${parseInt(logCVs.end.x)}, ${parseInt(logCVs.end.y)}`,
        `= THIS.SNP: ${parseInt(logCVs.snap.x)}, ${parseInt(logCVs.snap.y)}`,
        `= THIS.C-S: ${parseInt(logCVs.csnap.x)}, ${parseInt(logCVs.csnap.y)}`
      ]);
      // Reparent the die to its new home circle
      $(this.target).appendTo(`#${this.closestCircle.id}`);
      this.update();
      // return;
      CALLLOG.push(...[
        "==== REPARENTED ====",
        `= THIS:     ${parseInt(this.x)}, ${parseInt(this.y)}`,
        `= THIS.TRG: ${parseInt(gsap.getProperty(this.target, "x"))}, ${parseInt(parseInt(gsap.getProperty(this.target, "y")))}`,
        `= THIS.END: ${parseInt(this.endX)}, ${parseInt(this.endY)}`,
        `= THIS.SNP: ${parseInt(this.snapPoint.x)}, ${parseInt(this.snapPoint.y)}`,
        `= THIS.C-S: ${parseInt(this.convSnapPoint.x)}, ${parseInt(this.convSnapPoint.y)}`
      ]);

      // Set the die's position to the converted coordinates of its new parent circle
      gsap.set(this.target, {x: this.snapPoint.x, y: this.snapPoint.y});
      this.update();
      // gsap.fromTo(this.target, {x: logCVs.target.x, y: logCVs.target.y}, {x: this.snapPoint.x, y: this.snapPoint.y});

      // Restart the die's counter-rotation, now that it's in a rotating circle again. (Though, instead of '0', I think I need to start it at a negative offset rotation from wherever the circle has rotated to, for it to land in the correct orientation --- I'll worry about that later!)
      // gsap.to(this.closestCircle, {rotation: "+=360", duration: 100, repeat: -1});
      // gsap.to(this.target, {rotation: "+=360", duration: 100, repeat: -1, runBackwards: true, startAt: {rotation: -1 * gsap.getProperty(`#${this.closestCircle.id}`, "rotation")}});

      delete this.closestCircle.numBlanks;
      redistributeDice(this.closestCircle, 0);

      setTimeout(() => { console.log(CALLLOG) }, 2000);
    }
  }
);