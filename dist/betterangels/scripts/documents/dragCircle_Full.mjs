/* ****▌███████████████████████████████████████████████████████████████████████████▐**** *\
|*     ▌███████░░░░░░░░░░░░░░ Better Angels for Foundry VTT ░░░░░░░░░░░░░░░░███████▐     *|
|*     ▌██████████████████░░░░░░░░░░░░░ by Eunomiac ░░░░░░░░░░░░░██████████████████▐     *|
|*     ▌███████████████ MIT License █ v0.0.1-prealpha █ Sep 30 2021 ███████████████▐     *|
|*     ▌████████░░░░░░░░ https://github.com/Eunomiac/betterangels ░░░░░░░░█████████▐     *|
\* ****▌███████████████████████████████████████████████████████████████████████████▐**** */

// Can EASILY modify the snapping to first check if it has been moved a minimum distance
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
import gsap, {
  Draggable as GSDraggable,
  InertiaPlugin,
  MotionPathPlugin,
  CustomWiggle,
  CustomEase
} from "/scripts/greensock/esm/all.js";

const {
  getProperty,
  set,
  utils: {random: getRandom}
} = gsap;

gsap.registerPlugin(GSDraggable, InertiaPlugin, MotionPathPlugin, CustomWiggle, CustomEase);

const NEARNESSTHRESHOLD = 100;
const CIRCLESTATES = {
  targeted: {size: 10, color: "rgba(0, 0, 255, 1)", opacity: 0.75, duration: 0.5},
  invalid: {size: 10, color: "rgba(255, 0, 0, 1)", opacity: 0.1, duration: 0.5},
  near: {size: 20, color: "rgba(0, 130, 0, 1)", opacity: 0.75, duration: 0.5},
  inside: {size: 40, color: "rgba(0, 255, 0, 1)", opacity: 1, duration: 0.5},
  none: {size: 0, color: "rgba(0, 0, 0, 0)", opacity: 0.5, duration: 0.5}
};
const EASECURVES = {
  wiggle: CustomWiggle.create("wiggle", {wiggles: 10, type: "random"})
};

const CONTAINERPADDING = {left: 100, top: 50, bottom: 100, right: getProperty("#sidebar", "width") + 100};
const CIRCLES = [];
const DICE = [];

const getElem = (elem) => {
  if (elem instanceof GSDraggable) {
    return $(elem.target);
  } else if (elem instanceof $) {
    return elem;
  } else if ($(elem)[0] instanceof HTMLElement) {
    return $(elem);
  } else {
    return [false];
  }
};
const getPosData = (posRef) => {
  const elem = getElem(posRef);
  if (elem[0]) {
    const offset = elem.offset();
    const posData = {
      top: offset.top,
      left: offset.left,
      height: elem.height(),
      width: elem.width()
    };
    return {
      ...posData,
      x: posData.left + 0.5 * posData.width,
      y: posData.top + 0.5 * posData.height
    };
  } else if (/^\[object Object\]$/.test(String(posRef))) {
    const posData = {};
    if ("width" in posRef) {
      posData.width = posRef.width;
      if ("x" in posRef) {
        posData.left = posRef.x - 0.5 * posRef.width;
        posData.x = posRef.x;
      } else if ("left" in posRef) {
        posData.left = posRef.left;
        posData.x = posRef.left + 0.5 * posRef.width;
      }
    }
    if ("height" in posRef) {
      posData.height = posRef.height;
      if ("y" in posRef) {
        posData.top = posRef.y - 0.5 * posRef.height;
        posData.y = posRef.y;
      } else if ("top" in posRef) {
        posData.top = posRef.top;
        posData.y = posRef.top + 0.5 * posRef.height;
      }
    }
    return posData;
  } else {
    throw new Error(`Bad Position Object: ${JSON.stringify(elem)}`);
  }
};
const getCenterPoint = (elem) => {
  elem = getElem(elem);
  const [height, width] = [
    elem.height(),
    elem.width()
  ];
  [elem] = elem;
  return {
    x: gsap.getProperty(elem, "x") + 0.5 * width,
    y: gsap.getProperty(elem, "y") + 0.5 * width
  };
};
const getTopLeftPoint = ({x, y, height, width}) => ({
  left: x - 0.5 * width,
  top: y - 0.5 * height
});

const wiggle = (midPoint, range, paddingMult = 0) => {
  const padding = paddingMult * 0.5 * range;
  return midPoint + (Math.random() - 0.5) * (range - padding * 2);
};
const getDistanceToPoint = ({posX, posY}, elem) => {
  const {x, y} = getPosData(elem);
  return Math.sqrt((posX - x) ** 2 + (posY - y) ** 2);
};
const getDistanceToElem = (elemA, elemB) => {
  const {x, y} = getPosData(elemA);
  return getDistanceToPoint({
    posX: x,
    posY: y
  }, elemB);
};
const getClosestToPoint = ({posX, posY}, targetElems, startContainer = false) => {
  let closestDistance, closestTarget;
  targetElems.forEach((target) => {
    if (target !== startContainer) {
      const distance = getDistanceToPoint({posX, posY}, target);
      if (!closestDistance || distance < closestDistance) {
        closestDistance = distance;
        closestTarget = target;
      }
    }
  });
  return closestTarget;
};
const getClosestToElem = (elem, targetElems, startContainer = false) => {
  const {x, y} = getPosData(elem);
  return getClosestToPoint({
    posX: x,
    posY: y
  }, targetElems, startContainer);
};

const isInside = (dragElem, targetElem) => dragElem.hitTest(targetElem, "100%");
const isTouching = (dragElem, targetElem) => dragElem.hitTest(targetElem);
const isNear = (elem, targetElem) => getDistanceToElem(elem, targetElem) < (NEARNESSTHRESHOLD + ($(targetElem).width() * 0.5));

const setDieStartPos = (dice, circle, buffer = 0.3) => {
  const radius = (1 - buffer) * 0.5 * getElem(circle).width();
  const {x: centerX, y: centerY} = getCenterPoint(circle);
  const stepSize = 360 / (dice.length + 1);
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
  // debugger;

  // dice.forEach((die) => {
  //   angle += stepSize;
  //   const {left, top} = getTopLeftPoint({
  //     x: radius * Math.cos(angle) + centerX,
  //     y: radius * Math.sin(angle) + centerY,
  //     height: getElem(die).height(),
  //     width: getElem(die).width()
  //   });
  //   gsap.set(getElem(die), {
  //     x: radius * Math.cos(angle) + centerX - (0.5 * getElem(die).width()),
  //     y: radius * Math.sin(angle) + centerY - (0.5 * getElem(die).height())
  //   });
  // });
};

gsap.registerEffect({
  name: "pulse",
  defaults: {
    scaleSteps: [0.5, 2, 1],
    durationSteps: [0.25, 0.25, 0.5],
    easeSteps: ["power4.out", "power4.out", "sine.out"]
  },
  effect: (targets, config) => gsap.timeline()
    .to(targets, {scale: config.scaleSteps[0], duration: config.durationSteps[0], ease: config.easeSteps[0]})
    .to(targets, {scale: config.scaleSteps[1], duration: config.durationSteps[1], ease: config.easeSteps[1]})
    .to(targets, {scale: config.scaleSteps[2], duration: config.durationSteps[2], ease: config.easeSteps[2]})
});
gsap.registerEffect({
  name: "rotate",
  defaults: {
    duration: 400
  },
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
    /* gsap.to(targets, {
      keyframes: [
        {y: "+=50", duration: config.duration / 2},
        {y: "-=50", duration: config.duration / 2}
      ],
      ease: "wiggle",
      repeat: -1,
      get startAt() { return {y: `+=${gsap.utils.random(-50, 50)}`} },
      yoyo: true
    }); */
  }
});

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

const changeCircleState = (elem, state) => {
  if (elem) {
    const {size, color, duration, opacity} = CIRCLESTATES[state];
    gsap.effects.outline(elem, {size, color, duration});
    gsap.effects.fade(elem, {opacity, duration});
  }
};
const pulseCircle = (circle) => gsap.effects.pulse(circle);

const createDieElem = ({circle, color}) => {
  const dieID = `die${DICE.length + 1}`;
  const [dieElem] = $(`<div id="${dieID}" class="roll-die">${DICE.length + 1}</div>`).appendTo(circle);
  set(dieElem, {xPercent: -50, yPercent: -50, transformOrigin: "50% 50%"});
  return dieElem;
};

const createCircle = (numDice, {r, g, b}, {left, top, height, width}) => {
  const colors = {
    inner: `rgb(${Math.max(r, 150)}, ${Math.max(g, 150)}, ${Math.max(b, 150)})`,
    outer: `rgb(${r}, ${g}, ${b})`
  };
  const styles = {
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
  const rollCircle = $(`<div id="${circleID}" class="roll-circle">${CIRCLES.length + 1}</div>`)
    .appendTo(".vtt.game.system-betterangels")
    .css(styles);
  gsap.set(`#${circleID}`, {
    transformOrigin: "50% 50%",
    x: left,
    y: top});
  changeCircleState(rollCircle, "none");
  gsap.effects.rotate(rollCircle);
  CIRCLES.push(rollCircle);
  const circleDice = [];
  for (let i = 0; i < numDice; i++) {
    circleDice.push(createDieElem({circle: rollCircle, color: "#00FF00"}));
  }
  setDieStartPos(circleDice, rollCircle);
};

export default () => {
  [
    [3, {r: 255, g: 0, b: 255}, {top: CONTAINERPADDING.top, left: CONTAINERPADDING.left, height: 200, width: 200}],
    [4, {r: 255, g: 255, b: 0}, {top: CONTAINERPADDING.top, left: getProperty("#roll-container", "width") - 200 - CONTAINERPADDING.right, height: 200, width: 200}],
    [5, {r: 0, g: 255, b: 255}, {top: getProperty("#roll-container", "height") - 200 - CONTAINERPADDING.bottom, left: (getProperty("#roll-container", "width") - CONTAINERPADDING.right - 100) / 2, height: 200, width: 200}]
  ].forEach((params) => createCircle(...params));
};

const [die] = GSDraggable.create(
  dieElem,
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
          x: wiggle(x - (0.5 * $(this.target).width()), width, 0.6),
          y: wiggle(y - (0.5 * $(this.target).height()), height, 0.6)
        };
      }
    },
    onDragStart() {
      const closestCircle = getClosestToElem(this.target, CIRCLES);
      if (isInside(this, closestCircle)) {
        this.startCircle = closestCircle;
        changeCircleState(this.startCircle, "inside");
      }
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
          c) Also animate the rotation so the dummy die space faces the die being dragged
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
    }
  }
);
// const {x, y, height, width} = getPosData($(circle));
gsap.set(`#${dieID}`, {transformOrigin: "50% 50%"});
gsap.effects.rotate(die);
DICE.push(die);
return die;
};