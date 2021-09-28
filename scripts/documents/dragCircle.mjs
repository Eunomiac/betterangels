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
import GSDraggable from "/scripts/greensock/esm/Draggable.js";

const NEARNESSTHRESHOLD = 100;
const COLORCLASSES = ["blue", "red", "green", "grey", "no-outline"];

const CONTAINER = $(".vtt.game.system-betterangels");
const CONTAINERPADDING = {left: 100, top: 50, bottom: 100, right: $("#sidebar").width() + 100};
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

const changeCircleColor = (elem, className) => {
  [elem] = getElem(elem);
  if (elem && className) {
    elem.newColorClass = className;
    if (!elem.isChangingColor) {
      updateCircleColor(elem);
    }
  }
};

const updateCircleColor = (elem) => {
  [elem] = getElem(elem);
  if (elem) {
    const [curColorClass] = Array.from(elem.classList).filter((cls) => COLORCLASSES.includes(cls));
    elem.newColorClass = elem.newColorClass ?? "";
    if (curColorClass === elem.newColorClass) {
      elem.isChangingColor = false;
    } else {
      elem.isChangingColor = true;
      $(elem).switchClass(
        curColorClass,
        elem.newColorClass,
        {
          duration: 300,
          complete: () => {
            elem.isChangingColor = false;
            updateCircleColor(elem);
          }
        }
      );
    }
  }
};
const pulseCircle = (circle) => {
  if ("pulser" in circle) {
    circle.pulser.restart();
  }
};

const createDie = ({circle, color}) => {
  const dieID = `die${DICE.length + 1}`;
  const [die] = GSDraggable.create(
    $(`<div id="${dieID}" class="roll-die"/>`)
      .appendTo(".vtt.game.system-betterangels")
      .css({
        "position": "absolute",
        "background": `radial-gradient(ellipse, #FFFFFF, ${color} 90%)`,
        "height": 20,
        "width": 20,
        "border-radius": 10,
        "border": `3px solid ${color}`
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
            x: wiggle(x - (0.5 * $(this.target).width()), width, 0.6),
            y: wiggle(y - (0.5 * $(this.target).height()), height, 0.6)
          };
        }
      },
      onDragStart() {
        const closestCircle = getClosestToElem(this.target, CIRCLES);
        if (isInside(this, closestCircle)) {
          this.startCircle = closestCircle;
          changeCircleColor(this.startCircle, "green");
        }
      },
      onDrag() {
        if (isInside(this, this.startCircle)) {
          if (this.closestCircle) {
            changeCircleColor(this.closestCircle, "no-outline");
          }
          changeCircleColor(this.startCircle, "green");
        } else {
          changeCircleColor(this.startCircle, "red");
          const closestCircle = getClosestToElem(this.target, CIRCLES, this.startCircle);
          if (closestCircle !== this.closestCircle) {
            changeCircleColor(this.closestCircle, "no-outline");
            this.closestCircle = closestCircle;
          }
          if (this.closestCircle !== this.startCircle) {
            if (isNear(this.target, this.closestCircle)) {
              changeCircleColor(this.closestCircle, "green");
            } else {
              changeCircleColor(this.closestCircle, "blue");
            }
          }
        }
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
      },
      onThrowUpdate() {
        if (isInside(this, this.startCircle)) {
          if (this.closestCircle) {
            changeCircleColor(this.closestCircle, "no-outline");
          }
          changeCircleColor(this.startCircle, "green");
        } else {
          changeCircleColor(this.startCircle, "red");
          const closestCircle = getClosestToElem(this.target, CIRCLES, this.startCircle);
          if (closestCircle !== this.closestCircle) {
            changeCircleColor(this.closestCircle, "no-outline");
            this.closestCircle = closestCircle;
          }
          if (this.closestCircle !== this.startCircle) {
            if (isNear(this.target, this.closestCircle)) {
              changeCircleColor(this.closestCircle, "green");
            } else {
              changeCircleColor(this.closestCircle, "blue");
            }
          }
        }
      },
      onThrowComplete() {
        changeCircleColor(this.startCircle, "no-outline");
        changeCircleColor(this.closestCircle, "no-outline");
        this.startCircle = null;
        this.closestCircle = null;
      }
    }
  );
  const {x, y, height, width} = getPosData($(circle));
  gsap.set(`#${dieID}`, {
    x: wiggle(x - (0.5 * $(die.target).width()), width, 0.6),
    y: wiggle(y - (0.5 * $(die.target).height()), height, 0.6)
  });
  DICE.push(die);
};

const createCircle = (numDice, color, {left, top, height, width}, css = {}) => {
  const styles = {
    height,
    width,
    "position": "absolute",
    "pointer-events": "none",
    "background": `radial-gradient(ellipse, transparent, ${color} 70%)`,
    "border-radius": "50%",
    ...css
  };
  const circleID = `rollCircle${CIRCLES.length + 1}`;
  const rollCircle = $(`<div id="${circleID}" class="roll-circle"/>`)
    .appendTo(".vtt.game.system-betterangels")
    .css(styles);
  gsap.set(`#${circleID}`, {x: left, y: top});
  changeCircleColor(rollCircle, "no-outline");
  rollCircle.pulser = gsap.timeline({paused: true})
    .to(rollCircle, {scale: 0.5, duration: 0.25, ease: "power4.out"})
    .to(rollCircle, {scale: 2, duration: 0.25, ease: "power4.out"})
    .to(rollCircle, {scale: 1, duration: 0.5, ease: "sine.out"});
  CIRCLES.push(rollCircle);
  for (let i = 0; i < numDice; i++) {
    createDie({circle: rollCircle, color: "#00FF00"});
  }
};

export default () => {
  [
    [6, "#FF00FF", getPosData({top: CONTAINERPADDING.top, left: CONTAINERPADDING.left, height: 200, width: 200})],
    [6, "#FFFF00", getPosData({top: CONTAINERPADDING.top, left: CONTAINER.width() - 200 - CONTAINERPADDING.right, height: 200, width: 200})],
    [6, "#00FFFF", getPosData({top: CONTAINER.height() - 200 - CONTAINERPADDING.bottom, left: (CONTAINER.width() - CONTAINERPADDING.right - 100) / 2, height: 200, width: 200})]
  ].forEach((params) => createCircle(...params));
};