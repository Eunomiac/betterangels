/* ****▌███████████████████████████████████████████████████████████████████████████▐**** *\
|*     ▌███████░░░░░░░░░░░░░░ Better Angels for Foundry VTT ░░░░░░░░░░░░░░░░███████▐     *|
|*     ▌██████████████████░░░░░░░░░░░░░ by Eunomiac ░░░░░░░░░░░░░██████████████████▐     *|
|*     ▌███████████████ MIT License █ v0.0.1-prealpha █ Sep 30 2021 ███████████████▐     *|
|*     ▌████████░░░░░░░░ https://github.com/Eunomiac/betterangels ░░░░░░░░█████████▐     *|
\* ****▌███████████████████████████████████████████████████████████████████████████▐**** */// Can EASILY modify the snapping to first check if it has been moved a minimum distance
// from its origin: If it has, exclude the origin from the list of circles to check for closest
// distance to.
//
// Set up a hash table grid (10x10 pixels?) and precalculate which circle it will presnap to
//
// Each step, can highlight/glow what it will snap to at its current position (not counting momentum)
// Can scale intensity of glow with "weight" of each circle's "pull"
// Have scale go UP for origin circle, as ball nears minimum distance, so that it 'snaps' into nothing
//   when it breaks free.
// Can use this for separating sets as well!
// Can have sets get pushed away from ball as it snaps free
// Can have sets FIRST start to glow, then magnetically move towards ball as it approaches
// ████████ IMPORTS: Importing GreenSock & Registering Plugins ████████
import gsap, {
  Draggable as GSDraggable,
  InertiaPlugin,
  MotionPathPlugin
} from "/scripts/greensock/esm/all.js";

gsap.registerPlugin(InertiaPlugin, MotionPathPlugin);

// ████████ CONFIG: Configuration of Elements & Animations ████████
const NEARNESSTHRESHOLD = 100;

// ░░░░░░░[ANIMATIONS]░░░░ Reusable Configurations for GreenSock Animations ░░░░░░░
// ▮▮▮▮▮▮▮[EASE CURVES] Custom Ease Curves ▮▮▮▮▮▮▮

// ████████ UTILITY: Utility Functions ████████
const {
  getProperty,
  set,
  utils: {random: getRandom}
} = gsap;
// ░░░░░░░[Position]░░░░ Getting & Setting Element Positions ░░░░░░░
const getCenter = (elem) => ({
  x: getProperty(elem, "x") + 0.5 * getProperty(elem, "width"),
  y: getProperty(elem, "y") + 0.5 * getProperty(elem, "height")
});
const setCenter = (elem, {x, y}) => {
  x -= 0.5 * getProperty(elem, "width");
  y -= 0.5 * getProperty(elem, "height");
  set(elem, {x, y});
};

// ░░░░░░░[Distance]░░░░ Distance & Proximity Detection ░░░░░░░
const getDistance = ({x1, y1}, {x2, y2}) => Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
const getDistanceBetween = (elem1, elem2) => getDistance(getCenter(elem1), getCenter(elem2));
const getClosest = (elem, targetElems, excludeTargetElems = []) => {
  let closestDistance, closestTarget;
  targetElems
    .filter((target) => !excludeTargetElems.includes(target))
    .forEach((target) => {
      const distance = getDistanceBetween(elem, target);
      if (distance < (closestDistance ?? Infinity)) {
        closestDistance = distance;
        closestTarget = target;
      }
    });
  return closestTarget;
};
const isInside = (dragElem, targetElem) => dragElem.hitTest(targetElem, "100%");
const isNear = (elem, targetElem) => getDistanceBetween(elem, targetElem) < NEARNESSTHRESHOLD + (0.5 * getProp(targetElem, "width"));

// ████████ INITIALIZATION: DOM Elements & Animation Effects ████████
// ░░░░░░░[ELEMENTS]░░░░ Creating Static DOM Elements & Registry for Dynamic Elements ░░░░░░░
const [CONTAINER] = $("<div id=\"roller-container\" />").appendTo(".vtt.game.system-betterangels");
const [CIRCLES, DICE] = [[], []];

// ░░░░░░░[EFFECTS]░░░░ Registering GreenSock Effects ░░░░░░░

// ████████ ANIMATION EFFECTS: Defining & Registering Animation Effects  ████████
gsap.registerEffect({
  name: "rotate",
  defaults: {duration: 200},
  effect: (targets, config) => {
    gsap.to(targets, {
      rotation: "+=360",
      duration: config.duration,
      ease: "none",
      repeat: -1,
      // get startAt() { return {rotation: } <-- Can use that "random.." whatever string value instead

    })
  }
});
/*

  effect: (targets, config) => {
    gsap.to(targets, {
      rotation: "+=360",
      duration: config.duration,
      ease: "wiggle",
      repeat: -1,
      get startAt() {
        return {
          rotation: gsap.utils.random(0, 360),
          scale: gsap.utils.random(0.9, 1.1),
          opacity: gsap.utils.random(0.25, 1)
        };
      },
      yoyo: true
    });
    gsap.to(targets, {
      keyframes: [
        {scale: "-=0.1", duration: config.duration / 2},
        {scale: "+=0.2", duration: config.duration / 2}
      ],
      ease: "wiggle",
      repeat: -1,
      yoyo: true
    });
    gsap.to(targets, {
      keyframes: [
        {opacity: "-=0.25", duration: config.duration / 2},
        {opacity: "+=0.5", duration: config.duration / 2}
      ],
      ease: "wiggle",
      repeat: -1,
      yoyo: true
    });
    gsap.to(targets, {
      keyframes: [
        {y: "+=50", duration: config.duration / 2},
        {y: "-=50", duration: config.duration / 2}
      ],
      ease: "wiggle",
      repeat: -1,
      get startAt() { return {y: `+=${gsap.utils.random(-50, 50)}`} },
      yoyo: true
    });
  }
});*/

gsap.registerEffect({
  name: "outline",
  defaults: {
    size: 10,
    color: "rgba(255, 0, 0, 1)",
    duration: 2
  },
  effect: (targets, config) => gsap.to(targets, {duration: config.duration, outlineColor: config.color, outlineWidth: config.size})
});
gsap.registerEffect({
  name: "fade",
  defaults: {
    opacity: 0.5,
    duration: 2
  },
  effect: (targets, config) => gsap.to(targets, {opacity: config.opacity, duration: config.duration})
});

const setDieStartPos = (dice, circle, buffer = 0.3) => {
  const radius = (1 - buffer) * 0.5 * getElem(circle).width();
  const {x: centerX, y: centerY} = getCenter(circle);
  const stepSize = 360 / dice.length;
  let angle = 0;
  const posData = dice.map((die) => {
    angle += stepSize;
    const {left, top} = getTopLeftPoint({
      x: radius * Math.cos(angle * (Math.PI / 180)) + centerX, // (deg * Math.PI) / 180.0
      y: radius * Math.sin(angle * (Math.PI / 180)) + centerY,
      height: getElem(die).height(),
      width: getElem(die).width()
    });
    gsap.set(getElem(die), {
      x: left,
      y: top
    });
    return {angle, stepSize, numDice: dice.length, left, top};
  });
};

const CIRCLESTATES = {
  targeted: {size: 10, color: "rgba(0, 0, 255, 1)", opacity: 0.75, duration: 0.5},
  invalid: {size: 10, color: "rgba(255, 0, 0, 1)", opacity: 0.1, duration: 0.5},
  near: {size: 20, color: "rgba(0, 130, 0, 1)", opacity: 0.75, duration: 0.5},
  inside: {size: 40, color: "rgba(0, 255, 0, 1)", opacity: 1, duration: 0.5},
  none: {size: 0, color: "rgba(0, 0, 0, 0)", opacity: 0.5, duration: 0.5}
};

const changeCircleState = (elem, state) => {
  if (elem) {
    const {size, color, duration, opacity} = CIRCLESTATES[state];
    gsap.effects.outline(elem, {size, color, duration});
    gsap.effects.fade(elem, {opacity, duration});
  }
};
const pulseCircle = (circle) => gsap.effects.pulse(circle);

const createDie = ({circle, color}) => {
  const dieID = `die${DICE.length + 1}`;
  const [die] = GSDraggable.create(
    $(`<div id="${dieID}" class="roll-die">${DICE.length + 1}</div>`)
      .appendTo(".vtt.game.system-betterangels")
      .css({
        "position": "absolute",
        "background": `radial-gradient(ellipse, #FFFFFF, ${color} 90%)`,
        "height": DICEPARAMS.height,
        "width": DICEPARAMS.width,
        "outline": "3px solid #000000",
        "border-radius": 5
      }),
    {
      dragResistance: 0,
      type: "x,y",
      inertia: true,
      snap: {
        points(point) {
          let closestCircle = getClosestToPoint({
            posX: point.x,
            posY: point.y
          }, CIRCLES);
          if (closestCircle === this.startCircle && !isInside(this, this.startCircle)) {
            closestCircle = getClosestToPoint({
              posX: point.x,
              posY: point.y
            }, CIRCLES, this.startCircle);
          }
          const {x, y, width, height} = getPosData(closestCircle);
          return {
            x: wiggle(x - (0.5 * getProp(this, "width")), width, 0.6),
            y: wiggle(y - (0.5 * getProp(this, "height")), height, 0.6)
          };
        }
      },
      onDragStart() {
        const closestCircle = getClosestToElem(this.target, CIRCLES);
        if (isInside(this, closestCircle)) {
          this.startCircle = closestCircle;
          changeCircleState(this.startCircle, "inside");
        }
        /*
          1) Detach the die from being a child of the circle
          2) Set its position to absolute, without changing its actual position on screen
        */
      },
      onDrag() {
        if (isInside(this, this.startCircle)) {
          if (this.closestCircle !== this.startCircle) {
            changeCircleState(this.closestCircle, "none");
          }
          changeCircleState(this.startCircle, "inside");
        } else {
          changeCircleState(this.startCircle, "invalid");
          const closestCircle = getClosestToElem(this.target, CIRCLES, this.startCircle);
          if (closestCircle !== this.closestCircle) {
            changeCircleState(this.closestCircle, "none");
          }
          this.closestCircle = closestCircle;
          if (isInside(this, this.closestCircle)) {
            changeCircleState(this.closestCircle, "inside");
          } else if (isNear(this, this.closestCircle)) {
            changeCircleState(this.closestCircle, "near");
          } else {
            changeCircleState(this.closestCircle, "targeted");
          }
        }
        /*
          1) Separate out functions: "setClosestCircle(circle)", which also unsets the last closest circle.
              Inside that function ...
            a) Get positions of all dice currently snapped to that circle.
            b) Add an invisible dummy die snap target to the circle, and animate the redistribution of dice to make room.
            c) Also animate the rotation so the dummy die space faces the die being dragged (maybe use the SVGMotionPath plugin)
              For the circle being turned off ...
            a) Remove the dummy die space
            b) Animate the redistribution of dice to close off the room that was made.
            c) Animate a rapid "snap away" rotation, spinning the dice circle as if recoil.
        */
      },
      onRelease() {
        let targetCircle = getClosestToPoint({
          posX: this.endX,
          posY: this.endY
        }, CIRCLES);
        if (targetCircle === this.startCircle && !isInside(this, this.startCircle)) {
          targetCircle = getClosestToPoint({
            posX: this.endX,
            posY: this.endY
          }, CIRCLES, this.startCircle);
        }
        this.targetCircle = targetCircle;
        pulseCircle(this.targetCircle);
        /*
          1) Set snap target to position of dummy space created in rotating position ring
        */
      },
      onThrowUpdate() {
        if (isInside(this, this.startCircle)) {
          if (this.closestCircle) {
            changeCircleState(this.closestCircle, "none");
          }
          changeCircleState(this.startCircle, "inside");
        } else {
          changeCircleState(this.startCircle, "invalid");
          const closestCircle = getClosestToElem(this.target, CIRCLES, this.startCircle);
          if (closestCircle !== this.closestCircle) {
            changeCircleState(this.closestCircle, "none");
            this.closestCircle = closestCircle;
          }
          if (this.closestCircle !== this.startCircle) {
            if (isNear(this.target, this.closestCircle)) {
              changeCircleState(this.closestCircle, "near");
            } else {
              changeCircleState(this.closestCircle, "targeted");
            }
          }
        }
      },
      onThrowComplete() {
        changeCircleState(this.startCircle, "none");
        changeCircleState(this.closestCircle, "none");
        this.startCircle = null;
        this.closestCircle = null;
        /*
          1) Transfer the die object into being a child of the circle that grabbed it
          2) Might have to set its position to relative and figure out other positioning shit here
        */
      }
    }
  );
  gsap.set(`#${dieID}`, {transformOrigin: "50% 50%"});
  gsap.effects.rotate(die);
  DICE.push(die);
  return die;
};

const createCircle = (numDice, {r, g, b}, {left, top, height, width}, css = {}) => {
  const colors = {
    inner: `rgb(${Math.max(r, 150)}, ${Math.max(g, 150)}, ${Math.max(b, 150)})`,
    outer: `rgb(${r}, ${g}, ${b})`
  };
  const styles = {
    height,
    width,
    "position": "absolute",
    "pointer-events": "none",
    "background": `radial-gradient(ellipse, ${colors.inner}, ${colors.outer} 70%)`,
    "border-radius": "50%",
    "text-align": "center",
    "font-size": 64,
    "line-height": "200px",
    "font-weight": "bold",
    ...css
  };
  const circleID = `rollCircle${CIRCLES.length + 1}`;
  const [rollCircle] = $(`<div id="${circleID}" class="roll-circle">${CIRCLES.length + 1}</div>`)
    .appendTo(".vtt.game.system-betterangels")
    .css(styles);
  gsap.set(rollCircle, {
    transformOrigin: "50% 50%",
    x: left,
    y: top});
  changeCircleState(rollCircle, "none");
  gsap.effects.rotate(rollCircle);
  CIRCLES.push(rollCircle);
  const circleDice = [];
  for (let i = 0; i < numDice; i++) {
    circleDice.push(createDie({circle: rollCircle, color: "#00FF00"}));
  }
  setDieStartPos(circleDice, rollCircle);
};

const testGrid = {
  x: gsap.utils.distribute({
    base: CONTAINERPADDING.left,
    amount: getProp(CONTAINER, "width") - getProp("#sidebar", "width") - CONTAINERPADDING.left - CONTAINERPADDING.right,
    from: "start",
    grid: [2, 3],
    axis: "x"
  }),
  y: gsap.utils.distribute({
    base: CONTAINERPADDING.top,
    amount: CONTAINER.get("height") - CONTAINERPADDING.top - CONTAINERPADDING.bottom,
    from: "start",
    grid: [2, 3],
    axis: "y"
  })
};

export default () => {
  [
    [3, {r: 255, g: 0, b: 255}],
    [5, {r: 0, g: 255, b: 255}],
    [7, {r: 255, g: 0, b: 0}],
    [9, {r: 255, g: 255, b: 0}],
    [11, {r: 0, g: 0, b: 255}],
    [13, {r: 0, g: 255, b: 0}]
  ]
    .map((circParams, i, a) => [...circParams, {
      left: testGrid.x(i, circParams, a),
      top: testGrid.y(i, circParams, a),
      height: 200,
      width: 200
    }])
    .forEach((params) => createCircle(...params));
};